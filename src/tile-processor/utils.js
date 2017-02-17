'use strict';

const path = require('path');
const fs = require('fs');

const Jimp = require('jimp');

const RE_COORD = /^(-?\d+),(-?\d+)/;
const RE_FORMAT = /\.(png|bmp|jpg|jpeg)$/i;

module.exports = {
  RE_COORD,
  RE_FORMAT,

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
};