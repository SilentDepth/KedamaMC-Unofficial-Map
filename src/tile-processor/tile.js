'use strict';

const fs = require('fs');
const path = require('path');

const Jimp = require('jimp');

const Coord = require('./coord');

const _ = Symbol('dataset');

class Tile {
  constructor(file) {
    try {
      fs.accessSync(file);
    } catch (e) {
      console.warn(`${file} not exists`);
      return null;
    }

    this.file = file;
    this.coord = new Coord(path.basename(file, '.png'));
  }

  read() {
    if (this[_].image) {
      this[_].promise = Promise.resolve(this[_].image);
    } else {
      this[_].promise = Jimp.read(this.file).catch(e => {
        console.error(`reading ${this.file} failed: ${e.message || e}`);
      }).then(image => {
        this.image = image;
        this.width = image.bitmap.width;
        return image;
      });
    }
    return this[_].promise;
  }

  zoomOut() {
    const literal2 = this.coord.outCoordLiteral;
    const tilePosMap = new Map();

    this.coord.outCoordGroup.forEach(([pos, literal]) => {
      let tile = literal !== this.coord.literal
        ? new Tile(path.resolve(path.dirname(this.file), `./${literal}.png`))
        : this;
      if (tile) tilePosMap.add(tile, pos);
    });

    Promise.all(tilePosMap.keys().map(tile => tile.read())).then(() => {
      const canvas = new Jimp(this.width * 2, this.width * 2);
      tilePosMap.forEach((pos, tile) => {
        const [px, py] = Coord.parseLiteral(pos);
        canvas.blit(tile.image, px * tile.width, py * tile.width);
      });
      canvas.resize(this.width, this.width, Jimp.RESIZE_BEZIER);
      // Need zoom property
      // canvas.write(path.resolve(path.dirname))
    });
  }
}

module.exports = Tile;