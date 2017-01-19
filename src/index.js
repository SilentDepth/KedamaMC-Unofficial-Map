'use strict';

const fs = require('fs');
const path = require('path');

const Jimp = require('jimp');

const RE_COORDS = /^((-?\d+),(-?\d+))/;

function proc(z1Location) {
  let z1Filenames = fs.readdirSync(z1Location);
  let z1Coords = z1Filenames.map(filename => RE_COORDS.exec(filename)[1]);
  let extname = path.extname(z1Filenames[0]);
  let z1Images = {};
  let tileSize;

  function zoomOut(map) {
    let canvas = new Jimp(tileSize * 2, tileSize * 2);
    Reflect.ownKeys(map).forEach(coord => {
      const [dx, dz] = RE_COORDS.exec(coord).slice(2).map(el => +el);
      canvas.blit(map[coord], dx * tileSize, dz * tileSize);
    });
    canvas.resize(tileSize, tileSize, Jimp.RESIZE_BEZIER);
    return canvas;
  }

  function zoomIn(image) {
    let canvas = new Jimp(tileSize * 2, tileSize * 2);
    image.scan(0, 0, tileSize, tileSize, (x, y) => {
      [
        {x2: x * 2, y2: y * 2},
        {x2: x * 2 + 1, y2: y * 2},
        {x2: x * 2, y2: y * 2 + 1},
        {x2: x * 2 + 1, y2: y * 2 + 1}
      ].forEach(coord => {
        canvas.setPixelColor(image.getPixelColor(x, y), coord.x2, coord.y2);
      });
    });

    return {
      '0,0': canvas.clone().crop(0, 0, tileSize, tileSize),
      '1,0': canvas.clone().crop(tileSize, 0, tileSize, tileSize),
      '0,1': canvas.clone().crop(0, tileSize, tileSize, tileSize),
      '1,1': canvas.clone().crop(tileSize, tileSize, tileSize, tileSize)
    };
  }

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
      prepareDir(z1Location, zoom);

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

function throwErr(err) {
  throw err;
}

function prepareDir(z1Location, zoom) {
  let zoomDir = path.resolve(z1Location, `../z${zoom}`);
  try {
    fs.accessSync(zoomDir);
  } catch (e) {
    if (e.code === 'ENOENT') {
      fs.mkdirSync(zoomDir);
    } else throw e;
  }
}

const config = {
  MIN_ZOOM: 4,
  MAX_ZOOM: 2
};
const z1Locations = [];

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
        z1Locations.push(key);
      }
  }
});

z1Locations.forEach(location => {
  proc(location);
});