'use strict';

const https = require('https');
const fs = require('fs');
const path = require('path');

const ORIGIN = 'https://stats.kedamamc.com';

function getJSON(url, file) {
  return new Promise((resolve, reject) => {
    https.get(url, response => {
      const statusCode = response.statusCode;
      const contentType = response.headers['content-type'];
      if (statusCode !== 200) {
        console.error(`Request Failed. (Code: ${statusCode})`);
        reject(response);
      } else if (contentType !== 'application/json') {
        console.error(`Invalid content-type. Received ${contentType}`);
        reject(response);
        return;
      }

      let raw = '';
      response.setEncoding('utf8');
      response.pipe(fs.createWriteStream('./data/' + file || path.basename(url)));
      response.on('data', chunk => raw += chunk);
      response.on('end', () => {
        try {
          resolve(JSON.parse(raw));
        } catch (e) {
          console.error(e.message);
        }
      });
    }).setTimeout(5000, () => {
      console.warn(`Timeout for ${url}, will retry later`);
      reject('timeout');
    }).on('error', e => {
      console.error(`Got error: ${e.message}`);
    });
  }).catch(response => {
    response.resume();
  });
}

function short(uuid) {
  return uuid.replace(/-/g, '');
}

async function throttle(func, ...args) {
  try {
    const values = await Promise.all([
      func(...args),
      new Promise(resolve => setTimeout(resolve, 1000)),
    ]);
    return values[0];
  } catch (e) {
    throw new Error(e);
  }
}

(async function () {
  const players = await getJSON(ORIGIN + '/players.json');
  console.log(`${players.players.length} players in total`);

  for (const uuid of players.players) {
    console.log(`Downloading ${uuid}...`);
    try {
      await throttle(getJSON, `${ORIGIN}/${short(uuid)}/stats.json`, uuid + '.json');
    } catch (e) {
      console.log(e, '-', e.message);
      if (e.message || e === 'timeout') {
        players.players.push(uuid);
      }
    }
  }

  console.log('All done');
}());