'use strict';

const fs = require('fs');
const path = require('path');

const Jimp = require('jimp');

async function sync(from, to) {
  try {
    const [fromFiles, toFiles] = await readdirs(from, to);

    let intersection = [];
    let difference = [];
    fromFiles.forEach(el => {
      if (toFiles.includes(el)) intersection.push(el);
      else difference.push(el);
    });

    for (let file of intersection) {
      let fromFile = path.resolve(from, './' + file);
      let toFile = path.resolve(to, './' + file);
      if (!await diff(fromFile, toFile)) {
        difference.push(file);
      }
    }

    for (let file of difference) {
      let fromFile = path.resolve(from, './' + file);
      let toFile = path.resolve(to, './' + file);
      fs.createReadStream(fromFile).pipe(fs.createWriteStream(toFile));
    }

    return difference;
  } catch (err) {
    console.error('Error occurs during sync');
    throw new Error(err);
  }
}

function readdirs(...dirs) {
  return Promise.all(dirs.map(dir => new Promise((resolve, reject) => {
    return fs.readdir(dir, null, (err, files) => {
      if (err) reject(err);
      else resolve(files);
    });
  })));
}

async function diff(f1, f2) {
  const [j1, j2] = await Promise.all([f1, f2].map(file => Jimp.read(file)));
  return Jimp.diff(j1, j2).percent === 0;
}

module.exports = sync;