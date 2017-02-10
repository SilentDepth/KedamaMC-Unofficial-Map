'use strict';

const path = require('path');
const fork = require('child_process').fork;

const taskConfig = require('./task.config');

if (!(taskConfig.z1Dir instanceof Array)) {
  taskConfig.z1Dir = [taskConfig.z1Dir];
}

taskConfig.z1Dir.forEach(dir => {
  console.log(JSON.stringify(dir))
  //fork(path.resolve(process.argv[1], '../processor'), [JSON.stringify(dir)]);
});