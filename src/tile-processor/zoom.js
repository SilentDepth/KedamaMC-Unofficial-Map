'use strict';

const Jimp = require('jimp');

const RE_COORD = require('./utils').RE_COORD;
const POS = [
  [0, 0],
  [1, 0],
  [0, 1],
  [1, 1],
];

class CoordMapping {
  constructor(baseCoord) {
    this._ = {
      baseCoord,
    };
  }

  zoomOut() {
    const base = this._.baseCoord;
    const outCoord = base.map(n => Math.floor(n / 2));
    const outMap = POS.reduce((outMap, pos) => {
      outMap[pos.join(',')] = outCoord.map((n, idx) => n * 2 + pos[idx]);
      return outMap;
    }, {});
    return {
      outCoord,
      outMap,
    };
  }

  get outCoord() {
    if (!this._.outCoord) {
      const result = this.zoomOut();
      this._.outCoord = result.outCoord;
      this._.outMap = result.outMap;
    }
    return this._.outCoord;
  }

  get outMap() {
    if (!this._.outMap) {
      const result = this.zoomOut();
      this._.outCoord = result.outCoord;
      this._.outMap = result.outMap;
    }
    return this._.outMap;
  }
}

function zoomOut(map) {
  let tileSize = null;
  let canvas = null;

  Reflect.ownKeys(map).forEach(dcoord => {
    const tile = map[dcoord];
    if (!tile) return;

    const [dx, dz] = RE_COORD.exec(dcoord).slice(1).map(el => +el);
    if (canvas === null) {
      tileSize = tile.bitmap.width;
      canvas = new Jimp(tileSize * 2, tileSize * 2);
    }
    canvas.blit(tile, dx * tileSize, dz * tileSize);
  });
  canvas.resize(tileSize, tileSize, Jimp.RESIZE_BEZIER);

  return canvas;
}

function zoomIn(tile) {
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
}

module.exports = {
  CoordMapping,
  zoomOut,
  zoomIn,
};