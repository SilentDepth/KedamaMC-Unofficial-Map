'use strict';

const POS = [ [0, 0], [1, 0], [0, 1], [1, 1] ];
const _ = Symbol('dataset');

class Coord extends Array {
  constructor(literal) {
    const _coord = Coord.parseLiteral(literal);
    if (_coord.length !== 2) throw new Error('not a valid coord literal');

    super(..._coord);
    this[_] = {};
  }

  get x() {
    return this[0];
  }

  set x(val) {
    if (this[0] !== val) {
      this[0] = +val;
      this[_] = {};
    }
  }

  get y() {
    return this[1];
  }

  set y(val) {
    if (this[1] !== val) {
      this[1] = +val;
      this[_] = {};
    }
  }

  get literal() {
    if (!this[_].literal) {
      this[_].literal = [this.x, this.y].join(',');
    }
    return this[_].literal;
  }

  get outCoordLiteral() {
    if (!this[_].outCoordLit) {
      this[_].outCoordLit = this.map(n => Math.floor(n / 2)).join(',');
    }
    return this[_].outCoordLit;
  }

  get outCoordGroup() {
    if (!this[_].outCoordLits) {
      this[_].outCoordLits = {};
      POS.forEach(p => {
        this[_].outCoordLits[p.join(',')] = this.map((n, i) => (n % 2 ? n : n + 1) + p[i]).join(',');
      });
    }
    return this[_].outCoordLits;
  }

  get inCoordLiterals() {
    if (!this[_].inCoordLits) {
      this[_].inCoordLits = {};
      POS.forEach(p => {
        this[_].inCoordLits[p.join(',')] = this.map((n, i) => n * 2 + p[i]).join(',');
      });
    }
    return this[_].inCoordLits;
  }

  static parseLiteral(literal) {
    return literal.split(',').map(n => +n);
  }
}

module.exports = Coord;