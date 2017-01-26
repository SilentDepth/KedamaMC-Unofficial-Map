'use strict';

const fs = require('fs');
const path = require('path');
const fork = require('child_process').fork;

const utils = require('./utils');

const config = {
  MIN_ZOOM: 4,
  MAX_ZOOM: 2,
  BUNCH_SIZE: 50,
};

function start() {
  const z1Locations = parseArgv();

  z1Locations.forEach(z1Location => {
    const args = {
      config,
      z1Location,
    };
    fork('./src/processor', [JSON.stringify(args)]);
  });
}

function parseArgv() {
  const locations = [];

  process.argv.slice(2).forEach(el => {
    let [key, val] = el.split('=');
    switch (key.toLowerCase()) {
      case 'max':
        config.MAX_ZOOM = +val;
        break;
      case 'min':
        config.MIN_ZOOM = +val;
        break;
      default:
        if (val === void 0) {
          locations.push(key);
        }
    }
  });

  return locations;
}

start();
