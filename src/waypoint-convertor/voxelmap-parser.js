'use strict';

const fs = require('fs');

const data = fs.readFileSync(process.argv[2])
  .split('\n')
  .filter(line => line.startsWith('name:'))
  .map(line => {
    return line.split(',').reduce((a, b) => {
      let [key, value] = b.split(':');
      a[key] = value;
      return a;
    }, {});
  });
