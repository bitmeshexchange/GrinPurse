'use strict';
const log = require('./lib/log');
const path = require('path');
const fs = require('fs');
const isWin = /^win/.test(process.platform);
let appRootDir = require('app-root-dir').get().replace('app.asar', '').replace(/(\s+)/g, '\\$1');

function getGrinBin(name='grin') {
  log(`app root dir is ${appRootDir}`);
  let file = path.join(appRootDir, `./bin/${name}`);
  if (isWin) {
    file = path.join(appRootDir, '../',  `./bin/${name}.exe`);
    if (!fs.existsSync(file)) {
      file = path.join(appRootDir,  `./bin/${name}.exe`);
    }
  } 
  return file;
}

module.exports = getGrinBin;