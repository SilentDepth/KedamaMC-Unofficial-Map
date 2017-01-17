'use strict';

const fs = require('fs');
const path = require('path');

const Jimp = require('jimp');

const config = {};
process.argv.slice(2).forEach(el => {
  let [key, val] = el.split('=');
  switch (key) {
    case 'z1':
      config.Z1_LOCATION = val;
      break;
    case 'max':
      config.MAX_ZOOM = +val;
      break;
    case 'min':
      config.MIN_ZOOM = +val;
      break;
  }
});

config.Z1_LOCATION = '../tiles/voxelmap/images/z1';
config.MIN_ZOOM = 4;
config.MAX_ZOOM = 2;

// 读取z1目录
const RE_FILENAME = /^((-?\d+),(-?\d+))/;
let tiles = fs.readdirSync(config.Z1_LOCATION).map(filename => RE_FILENAME.exec(filename)[1]);
let tileMap = {};
tiles.forEach(filename => {
  tileMap[filename] = true;
});

let zoomLevels;

// 生成缩小图块
zoomLevels = new Array(config.MIN_ZOOM + 1).join('-').split('').map((el, idx) => 1 / Math.pow(2, idx + 1));
let lastZoomedTiles = JSON.parse(JSON.stringify(tiles));
let zoomMappings = tiles.reduce((a, b) => {
  let [m, n] = RE_FILENAME.exec(b).slice(2).map(el => +el);
  let [m2, n2] = [m, n].map(el => Math.floor(el / 2));
  let key = `${m2},${n2}`;
  if (a[key] === void 0) {
    a[key] = {}
  }
  a[key][`${Math.abs(m) % 2},${Math.abs(n) % 2}`] = b;
}, {});
zoomLevels.forEach(zoom => {
  let zoomDirPath = path.resolve(config.Z1_LOCATION, `../z${zoom}`);
  if (!fs.statSync(zoomDirPath).isDirectory()) {
    fs.mkdirSync(zoomDirPath);
  }

  let output = [];

  // lastZoomedTiles.forEach((name, idx))
});
console.log(zoomMappings)

// 生成放大图块
zoomLevels = new Array(config.MAX_ZOOM + 1).join('-').split('').map((el, idx) => Math.pow(2, idx + 1));
console.log(zoomLevels);