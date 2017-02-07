'use strict';

const parser = require('./parser');
const writer = require('./writer');

let taskConfig = require('./task.config');

if (!(taskConfig instanceof Array)) {
  taskConfig = [taskConfig];
}

taskConfig.forEach(task => {
  let output = parser[task.from[0].toLowerCase() + 'Parser'](task.from[1]);
  writer[task.to[0].toLowerCase() + 'Writer'](task.to[1], output);
});