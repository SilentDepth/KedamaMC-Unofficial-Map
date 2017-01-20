'use strict';

const fs = require('fs');
const path = require('path');
const fork = require('child_process').fork;

const Jimp = require('jimp');

const utils = require('./utils');

const config = {
  MIN_ZOOM: 4,
  MAX_ZOOM: 2,
  BUNCH_SIZE: 50,
};

function start() {
  const z1Locations = parseArgv();
  let activeChildCount = 0;

  z1Locations.forEach(location => {
    const args = [`z1=${location}`, `config=${JSON.stringify(config)}`];
    const childProc = fork('./src/processor', args);
    activeChildCount++;
    childProc.on('close', code => {
      activeChildCount--;
      console.log(code, activeChildCount);
    });
  });
}

function parseArgv() {
  const locations = [];

  process.argv.slice(2).forEach(el => {
    let [key, val] = el.split('=');
    switch (key) {
      case 'max':
        config.MAX_ZOOM = +val;
        break;
      case 'min':
        config.MIN_ZOOM = +val;
        break;
      default:
        if (val === void 0) {
          locations.push(key);
        }
    }
  });

  return locations;
}

function proc(z1Location) {
  let z1Filenames = fs.readdirSync(z1Location);
  let z1Coords = z1Filenames.map(filename => RE_COORDS.exec(filename)[1]);
  let extname = path.extname(z1Filenames[0]);
  let z1Images = {};
  let tileSize;

  Promise.all(z1Coords.map(coord =>
    Jimp.read(path.resolve(z1Location, coord + extname)).then(image => {
      z1Images[coord] = image;
      return Promise.resolve();
    })
  )).catch(throwErr).then(() => {
    tileSize = z1Images[z1Coords[0]].bitmap.width;
  }).then(() => {
    // 缩小

    let phasePromise = Promise.resolve(z1Images);

    new Array(config.MIN_ZOOM + 1).join('-').split('').map((el, idx) => 1 / Math.pow(2, idx + 1)).forEach(zoom => {
      utils.prepareZoomDir(z1Location, zoom);

      phasePromise = phasePromise.then(lastProcessed => {
        console.log('processing', zoom);
        return Reflect.ownKeys(lastProcessed).reduce((a, b) => {
          const [x, z] = RE_COORDS.exec(b).slice(2).map(el => +el);
          const [x2, z2] = [x, z].map(el => Math.floor(el / 2));
          let key = `${x2},${z2}`;
          if (!Reflect.has(a, key)) {
            a[key] = {}
          }
          a[key][`${Math.abs(x) % 2},${Math.abs(z) % 2}`] = lastProcessed[b];
          return a;
        }, {});
      }).then(mapping => {
        let output = {};

        return Promise.all(Reflect.ownKeys(mapping).map(coord => {
          return new Promise(resolve => {
            let zoomed = zoomOut(mapping[coord]);
            output[coord] = zoomed;
            zoomed.write(path.resolve(z1Location, `../z${zoom}`, `${coord}${extname}`), resolve);
          });
        })).then(() => {
          console.log('processed', zoom);
          return output;
        });
      });
    });

    return phasePromise;
  }).then(() => {
    // 放大

    let phasePromise = Promise.resolve(z1Images);

    new Array(config.MAX_ZOOM + 1).join('.').split('').map((el, idx) => Math.pow(2, idx + 1)).forEach(zoom => {
      prepareDir(z1Location, zoom);

      phasePromise = phasePromise.then(lastProcessed => {
        console.log('processing', zoom);
        let output = {};
        Reflect.ownKeys(lastProcessed).forEach(coord => {
          const [x, z] = RE_COORDS.exec(coord).slice(2).map(el => +el);
          const zoomedMap = zoomIn(lastProcessed[coord]);
          Reflect.ownKeys(zoomedMap).forEach(dcoord => {
            const [dx, dz] = RE_COORDS.exec(dcoord).slice(2).map(el => +el);
            output[`${x * 2 + dx},${z * 2 + dz}`] = zoomedMap[dcoord];
          });
        });

        return output;
      }).then(mapping => {
        return Promise.all(Reflect.ownKeys(mapping).map(coord => {
          return new Promise(resolve => {
            mapping[coord].write(path.resolve(z1Location, `../z${zoom}`, `${coord}${extname}`), resolve);
          });
        })).then(() => {
          console.log('processed', zoom);
          return mapping;
        });
      });
    });

    return phasePromise;
  }).then(() => {
    console.log('all done');
  });
}

start();