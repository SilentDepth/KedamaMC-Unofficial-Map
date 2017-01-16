const Jimp = require('jimp');

function throwErr(err) {
  'use strict';
  throw err;
}

class Tile {
  constructor(path) {
    [this.x, this.y] = /(-?\d+),(-?\d+)\.png$/.exec(path).slice(1).map(el => +el);
    this.image = Jimp.read(path).then(image => image).catch(throwErr);
    ({width: this.width, height: this.height}) = this.image.bitmap;
  }

  zoomIn(zoom = 2) {
    zoom = Math.floor(zoom);

    let image2x = new Jimp(this.width * zoom, this.height * zoom);

    this.image.scan(0, 0, this.width, this.height, (x, y) => {
      [
        [x * zoom, y * zoom],
        [x * zoom, y * zoom + 1],
        [x * zoom + 1, y * zoom],
        [x * zoom + 1, y * zoom + 1]
      ].forEach(c => {
        image2x.setPixelColor(this.image.getPixelColor(x, y), c[0], c[1]);
      });
    });

    let output = {};

    new Array(zoom * zoom + 1).join('-').split('').forEach((el, idx) => {
      let dx = idx % zoom;
      let dy = Math.floor(idx / zoom);
      output[`${this.x * zoom + dx},${this.y * zoom + dy}`] = image2x.clone.crop(dx * this.width, dy * this.height, this.width, this.height);
    });

    return output;
  }
}

module.exports = Tile;