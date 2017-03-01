'use strict';

const https = require('https');
const fs = require('fs');

const ORIGIN = 'https://stats.kedamamc.com';

function getJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      const statusCode = res.statusCode;
      const contentType = res.headers['content-type'];
      if (statusCode !== 200) {
        console.error(`Request Failed. (Code: ${statusCode})`);
        reject(res);
      } else if (contentType !== 'application/json') {
        console.error(`Invalid content-type. Received ${contentType}`);
        reject(res);
        return;
      }

      let raw = '';
      res.setEncoding('utf8');
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(raw));
        } catch (e) {
          console.error(e.message);
        }
      });
    }).on('error', e => {
      console.error(`Got error: ${e.message}`);
    });
  }).catch(res => {
    res.resume();
  });
}

function short(uuid) {
  return uuid.replace('-', '');
}

function one(promise) {
  return Promise.all([
    promise,
    new Promise(resolve => {
      setTimeout(resolve, 1000);
    }),
  ]);
}

function download(url, file) {
  return new Promise((resolve, reject) => {
    https.get(`${ORIGIN}/players.json`, res => {
      const statusCode = res.statusCode;
      if (statusCode !== 200) {
        console.error(statusCode);
        reject();
        return;
      }

      const target = fs.createWriteStream('./data/f4600964-9ff0-4a52-a958-31b7b9b1330a.json');
      res.pipe(target, {end: false});
      res.on('end', () => {
        console.log('end');
        resolve();
      });
    });
  });
}