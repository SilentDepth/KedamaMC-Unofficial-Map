'use strict';

const path = require('path');
const fs = require('fs');

const Jimp = require('jimp');

const RE_COORD = /^(-?\d+),(-?\d+)/;

module.exports = {
  RE_COORD: RE_COORD,

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
        {x2: x * 2    , y2: y * 2},
        {x2: x * 2 + 1, y2: y * 2},
        {x2: x * 2    , y2: y * 2 + 1},
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
};