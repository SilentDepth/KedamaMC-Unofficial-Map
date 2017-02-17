'use strict';

const path = require('path');
const fork = require('child_process').fork;

const taskConfig = require('./task.config');

[].concat(taskConfig.z1Dir).forEach((dir, idx) => {
  fork(path.resolve(process.argv[1], '../processor'), idx);
});