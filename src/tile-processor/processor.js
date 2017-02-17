'use strict';

const fs = require('fs');
const path = require('path');

const Jimp = require('jimp');

const taskConfig = require('./task.config');
const utils = require('./utils');
const sync = require('./sync');
const {CoordMapping, zoomOut, zoomIn} = require('./zoom');

/*
 * 处理参数，声明顶级变量
 */

const _dirArg = [].concat(taskConfig.z1Dir)[process.argv[2] || 0];
const z1Location = typeof _dirArg === 'string' ? _dirArg : _dirArg.to;
let isUpdateMode = false;
let promise;
let z1Coords;
let extname;

/*
 * 判断是否需要同步目录，生成起始数据
 *
 * 只当定义`from`时才进行同步
 */

if (typeof _dirArg.from === 'string') {
  promise = sync(_dirArg.from, _dirArg.to);
  isUpdateMode = true;
} else {
  let filenames = fs.readdirSync(z1Location).filter(filename => utils.RE_FORMAT.test(filename));
  promise = Promise.resolve(filenames);
}
promise = promise.then(filenames => {
  extname = path.extname(filenames[0]);
  z1Coords = filenames.map(filename => path.basename(filename, extname));
});

console.log(`[PID ${process.pid}] processing ${z1Location}`);

/*
 * 缩小
 */

promise = promise.then(() => z1Coords);

// 缩放等级遍历
utils.makeArray(taskConfig.minZoom).forEach(idx => {
  const zoom = 1 / Math.pow(2, idx + 1);

  utils.prepareZoomDir(z1Location, zoom);

  promise = promise.then(coords => {
    // 生成坐标映射

    return coords.reduce((mappings, coord) => {
      const mapping = new CoordMapping(utils.parseCoord(coord));
      const outCoord = mapping.outCoord.join(',');
      if (!mappings[outCoord]) {
        mappings[outCoord] = mapping.outMap;
      }
      return mappings;
    }, {});
  }).then(map => {
    // 根据坐标映射缩放图块

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
              m[pos] = null;
            });
          })).then(() => {
            return new Promise(resolve => {
              zoomOut(m).write(path.resolve(z1Location, `../z${zoom}/${coord2}${extname}`), resolve);
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

/*
 * 放大
 */

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
            let map = zoomIn(image);

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

/*
 * 结束
 */

promise = promise.then(() => {
  console.log(`[${z1Location}] done`);
  process.exit();
});
