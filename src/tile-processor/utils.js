'use strict';

const path = require('path');
const fs = require('fs');

const Jimp = require('jimp');

const RE_COORD = /^(-?\d+),(-?\d+)/;
const RE_FORMAT = /\.(png|bmp|jpg|jpeg)$/i;

module.exports = {
  RE_COORD,
  RE_FORMAT,

  zoomOut(map) {
    let tileSize = null;
    let canvas = null;

    Reflect.ownKeys(map).forEach(dcoord => {
      const tile = map[dcoord];
      const [dx, dz] = RE_COORD.exec(dcoord).slice(1).map(el => +el);
      if (canvas === null) {
        tileSize = tile.bitmap.width;
        canvas = new Jimp(tileSize * 2, tileSize * 2);
      }
      canvas.blit(tile, dx * tileSize, dz * tileSize);
    });
    canvas.resize(tileSize, tileSize, Jimp.RESIZE_BEZIER);

    return canvas;
  },

  zoomIn(tile) {
    let tileSize = tile.bitmap.width;
    let canvas = new Jimp(tileSize * 2, tileSize * 2);

    tile.scan(0, 0, tileSize, tileSize, (x, y) => {
      [
        {x2: x * 2, y2: y * 2},
        {x2: x * 2 + 1, y2: y * 2},
        {x2: x * 2, y2: y * 2 + 1},
        {x2: x * 2 + 1, y2: y * 2 + 1},
      ].forEach(pos => {
        canvas.setPixelColor(tile.getPixelColor(x, y), pos.x2, pos.y2);
      });
    });

    return {
      '0,0': canvas.clone().crop(0, 0, tileSize, tileSize),
      '1,0': canvas.clone().crop(tileSize, 0, tileSize, tileSize),
      '0,1': canvas.clone().crop(0, tileSize, tileSize, tileSize),
      '1,1': canvas.clone().crop(tileSize, tileSize, tileSize, tileSize)
    };
  },

  prepareZoomDir(z1Location, zoom) {
    let dirPath = path.resolve(z1Location, `../z${zoom}`);
    try {
      fs.accessSync(dirPath);
    } catch (e) {
      if (e.code === 'ENOENT') {
        fs.mkdirSync(dirPath);
      } else throw e;
    }
  },

  makeArray(length) {
    return new Array(length + 1).join('.').split('').map((el, idx) => idx);
  },

  parseCoord(coordStr) {
    return this.RE_COORD.exec(coordStr).slice(1).map(s => +s);
  },

  compare(file1, file2) {
    return Promise.all([
      Jimp.read(file1).catch(err => console.log(`${file1} error: ${err}`)),
      Jimp.read(file2).catch(err => console.log(`${file2} error: ${err}`)),
    ]).then(images => {
      images.forEach((img, idx) => {
        if (!(img instanceof Jimp)) {
          console.log(`${idx + 1} not a Jimp`);
        }
      });
      return Jimp.diff(...images).percent === 0;
    });
  },

  sync(from, to) {
    return Promise.all([
      new Promise(resolve => fs.readdir(from, null, (err, files) => resolve(files))),
      new Promise(resolve => fs.readdir(to, null, (err, files) => resolve(files))),
    ]).then(value => {
      const [fromFiles, toFiles] = value;
      return Promise.all(fromFiles.map(file => new Promise(resolve => {
        // 如果存在，比对图像，有差异则记录
        if (toFiles.indexOf(file) >= 0) {
          this.compare(path.resolve(from, './' + file), path.resolve(to, './' + file))
            .then(isSame => {
              resolve(isSame ? null : file);
            });
        } else resolve(file);
      })));
    }).then(diffFiles => {
      diffFiles = diffFiles.filter(el => el !== null);
      diffFiles.forEach(file => {
        fs.createReadStream(path.resolve(from, './' + file))
          .pipe(fs.createWriteStream(path.resolve(to, './' + file)));
      });
      return diffFiles;
    });
  },
};