'use strict';

const fs = require('fs');
const path = require('path');

const Jimp = require('jimp');

const Tile = require('./tile');

async function zoomOut(tile) {
  // 检测文件是否齐全
  let proms = Object.entries(coord).map(([pos, coordLiteral]) => {
    return new Promise((resolve, reject) => {
      fs.stat()
    });
  });
}