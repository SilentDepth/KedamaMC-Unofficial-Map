'use strict';

const fs = require('fs');
const path = require('path');

const Jimp = require('jimp');

const utils = require('./utils');
const taskConfig = require('./task.config');

// const _dirArg = JSON.parse(process.argv[2]);
const _dirArg = JSON.parse('{"from":"E:/Repo/kedamamc-unofficial-map/test/from","to":"E:/Repo/kedamamc-unofficial-map/test/to - 副本"}');
let z1Location;
let z1Coords;
let extname;
let promise;

if (typeof _dirArg === 'object') {
  z1Location = _dirArg.to;
  promise = utils.sync(_dirArg.from, _dirArg.to).then(files => {
    extname = path.extname(files[0]);
    z1Coords = files.map(file => path.basename(file, extname));
  }).catch(err => console.log(err));
} else {
  z1Location = _dirArg;
  let filenames = fs.readdirSync(z1Location).filter(filename => utils.RE_FORMAT.test(filename));
  extname = path.extname(filenames[0]);
  z1Coords = filenames.map(filename => path.basename(filename, extname));
}

console.log(`[PID ${process.pid}] processing ${z1Location}`);

// 缩小

promise = promise.then(() => z1Coords);

// 缩放等级遍历
utils.makeArray(taskConfig.minZoom).forEach(idx => {
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
    const bunchSize = Math.floor(taskConfig.bunchSize / 4);

    let stepPromise = Promise.resolve();

    utils.makeArray(Math.ceil(coords2.length / bunchSize)).forEach(idx => {
      stepPromise = stepPromise.then(() => {
        const coord2Bunch = coords2.slice(idx * bunchSize, (idx + 1) * taskConfig.bunchSize);

        return Promise.all(coord2Bunch.map(coord2 => {
          let m = JSON.parse(JSON.stringify(map[coord2]));

          return Promise.all(Reflect.ownKeys(m).map(pos => {
            let filepath = path.resolve(z1Location, `../z${zoom * 2}/${m[pos]}${extname}`);

            return Jimp.read(filepath).then(image => {
              m[pos] = image;
            }).catch(e => {
              console.error(`error occurs while reading ${filepath}. (${e.message || e})`);
            });
          })).then(() => {
            return new Promise(resolve => {
              utils.zoomOut(m).write(path.resolve(z1Location, `../z${zoom}/${coord2}${extname}`), resolve);
            });
          });
        }));
      });
    });

    return stepPromise.then(() => {
      console.log(`[${z1Location}] level ${zoom} processed`);
      return coords2;
    });
  });
});

// 放大

promise = promise.then(() => z1Coords);

// 遍历缩放等级
utils.makeArray(taskConfig.maxZoom).forEach(idx => {
  const zoom = Math.pow(2, idx + 1);
  const coords2 = [];

  utils.prepareZoomDir(z1Location, zoom);

  promise = promise.then(coords => {
    const bunchSize = Math.floor(taskConfig.bunchSize / 4);

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
            console.error(`error occurs while reading ${filepath}. (${e.message || e})`);
          });
        }));
      });
    });

    return stepPromise.then(() => {
      console.log(`[${z1Location}] level ${zoom} processed`);
      return coords2;
    });
  });
});

promise = promise.then(() => {
  console.log(`[${z1Location}] done`);
  process.exit();
});
