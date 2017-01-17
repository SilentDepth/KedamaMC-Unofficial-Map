const path = require('path');

const Jimp = require('jimp');

class Tile {
  constructor(filepath) {
    this.filepath = path.resolve(filepath);
    [this.x, this.y] = /(-?\d+),(-?\d+)\.png$/.exec(this.filepath).slice(1).map(el => +el);
    this.promise = Jimp.read(this.filepath).then(image => {
      this.image = image;
      ({width: this.width, height: this.height} = this.image.bitmap);
    }).catch(throwErr);
  }

  zoomIn(zoom = 2) {
    zoom = Math.floor(zoom);

    this.promise.then(() => {
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
        output[`${this.x * zoom + dx},${this.y * zoom + dy}`] = image2x.clone().crop(dx * this.width, dy * this.height, this.width, this.height);
      });

      console.log(1)
      return Promise.resolve(output);
    }).catch(throwErr);

    return this;
  }

  write(to = '.') {
    this.promise.then(output => {
      console.log(2)
      Reflect.ownKeys(output).forEach(name => {
        output[name].write(`${path.resolve(this.filepath, to, name)}.png`);
      });
    }).catch(throwErr);

    return this;
  }
}

function throwErr(err) {
  'use strict';
  throw err;
}

module.exports = Tile;