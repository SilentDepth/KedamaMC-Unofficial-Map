'use strict';

const fs = require('fs');
const path = require('path');

function voxelmapParser(pointsFile) {
  return fs.readFileSync(pointsFile, 'utf8')
    .split('\n')
    .filter(line => line.startsWith('name:'))
    .map(line => {
      return line.split(',').reduce((a, b) => {
        let [key, value] = b.split(':');
        switch (key) {
          case 'x':
          case 'y':
          case 'z':
            a[key] = +value;
            break;
          case 'red':
          case 'green':
          case 'blue':
            a[key[0]] = Math.round(+value * 255);
            break;
          case 'suffix':
            a['type'] = value;
            break;
          default:
            a[key] = value;
        }
        return a;
      }, {});
    });
}

function journeymapParser(jsonDir) {
  return fs.readdirSync(jsonDir).map(jsonFile => {
    let txt = fs.readFileSync(path.resolve(jsonDir, './' + jsonFile), 'utf8');
    return JSON.parse(txt);
  });
}

module.exports = {
  voxelmapParser,
  journeymapParser,
};