'use strict';

const fs = require('fs');
const path = require('path');

const Jimp = require('jimp');

const utils = require('./utils');

// const {config, z1Location} = JSON.parse(process.argv.slice(2)[0]);
const {config, z1Location} = {
  z1Location: '../tiles/journeymap/images/z1',
  config: {
    MIN_ZOOM: 4,
    MAX_ZOOM: 2,
    BUNCH_SIZE: 50
  }
};

console.log(`[PID ${process.pid}] processing ${z1Location}`);

const [z1Coords, extname] = (() => {
  let filenames = fs.readdirSync(z1Location);
  let extname = path.extname(filenames[0]);
  let coords = filenames.map(filename => path.basename(filename, extname));
  return [coords, extname];
})();

// 缩小

let promise = Promise.resolve(z1Coords);

// 缩放等级遍历
utils.makeArray(config.MIN_ZOOM).forEach(idx => {
  const zoom = 1 / Math.pow(2, idx + 1);

  utils.prepareZoomDir(z1Location, zoom);

  promise = promise.then(coords => {
    // 生成坐标映射

    return coords.reduce((a, b) => {
      const [x, z] = utils.parseCoord(b);
      const [x2, z2] = [x, z].map(el => Math.floor(el / 2));
      const k2 = `${x2},${z2}`;

      if (!Reflect.has(a, k2)) {
        a[k2] = {}
      }
      a[k2][`${Math.abs(x) % 2},${Math.abs(z) % 2}`] = b;
      return a;
    }, {});
  }).then(map => {
    const coords2 = Reflect.ownKeys(map);
    const bunchSize = Math.floor(config.BUNCH_SIZE / 4);

    let stepPromise = Promise.resolve();

    utils.makeArray(Math.ceil(coords2.length / bunchSize)).forEach(idx => {
      stepPromise = stepPromise.then(() => {
        const coord2Bunch = coords2.slice(idx * bunchSize, (idx + 1) * config.BUNCH_SIZE);

        return Promise.all(coord2Bunch.map(coord2 => {
          let m = map[coord2];

          return Promise.all(Reflect.ownKeys(m).map(pos => {
            let filepath = path.resolve(z1Location, `../z${zoom * 2}/${m[pos]}${extname}`);

            return Jimp.read(filepath).then(image => {
              m[pos] = image;
            }).catch(e => {
              console.error(`error occurs when reading ${filepath}. (${e})`);
            });
          })).then(() => {
            return new Promise(resolve => {
              utils.zoomOut(m).write(path.resolve(z1Location, `../z${zoom}/${coord2}${extname}`), resolve);
            });
          });
        }));
      });
    });

    console.log(`[${z1Location}] level ${zoom} processed`);
    return stepPromise.then(() => coords2);
  });
});

// 放大

promise = promise.then(z1Coords);

// 遍历缩放等级
utils.makeArray(config.MAX_ZOOM).forEach(idx => {
  const zoom = Math.pow(2, idx + 1);
  const coords2 = [];

  utils.prepareZoomDir(z1Location, zoom);

  promise = promise.then(coords => {
    const bunchSize = Math.floor(config.BUNCH_SIZE / 4);

    let stepPromise = Promise.resolve();

    utils.makeArray(Math.ceil(coords.length / bunchSize)).forEach(idx => {
      stepPromise = stepPromise.then(() => {
        const coordBunch = coords.slice(idx * bunchSize, (idx + 1) * bunchSize);

        return Promise.all(coordBunch.map(coord => {
          let filepath = path.resolve(z1Location, `../z${zoom / 2}/${coord}${extname}`);

          return Jimp.read(filepath).then(image => {
            let map = utils.zoomIn(image);

            return Promise.all(Reflect.ownKeys(map).map(pos => {
              return new Promise(resolve => {
                const [posx, posz] = utils.parseCoord(pos);
                const [x, z] = utils.parseCoord(coord);
                const coord2 = `${x * 2 + posx},${z * 2 + posz}`;

                coords2.push(coord2);
                map[pos].write(path.resolve(z1Location, `../z${zoom}/${coord2}${extname}`), resolve);
              });
            }));
          }).catch(e => {
            console.error(`error occurs when reading ${filepath}. (${e})`);
          });
        }));
      });
    });

    console.log(`[${z1Location}] level ${zoom} processed`);
    return stepPromise.then(() => coords2);
  });
});

promise = promise.then(() => {
  console.log(`${z1Location} done`);
});