'use strict';

const fs = require('fs');
const path = require('path');

function journeymapWriter(target, markers) {
  const amount = markers.length;
  let counter = 0;

  markers.forEach(marker => {
    let obj = {
      id: `${marker.name}_${marker.x},${marker.y},${marker.z}`,
      name: marker.name,
      icon: 'waypoint-normal.png',
      x: marker.x,
      y: marker.y,
      z: marker.z,
      r: marker.r,
      g: marker.g,
      b: marker.b,
      enable: true,
      type: 'Normal',
      origin: 'journeymap',
      dimensions: [0],
      persistent: true,
    };
    fs.writeFile(path.resolve(target, `./${obj.id}.json`), JSON.stringify(obj), () => {
      if (++counter >= amount) {
        // TODO: Multi-task support
        process.exit();
      }
    });
  });
}

module.exports = {
  journeymapWriter,
};