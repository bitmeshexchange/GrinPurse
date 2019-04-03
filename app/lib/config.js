'use strict';
const path = require('path');
const fs = require('fs');
const homedir = require('homedir-polyfill')();
const mkdirp = require('mkdirp');
const wallet_dir = path.join(homedir, '.grin/main');
mkdirp.sync(path.join(wallet_dir, 'wallet_data'));

const seedFile = path.join(wallet_dir, 'wallet_data/wallet.seed');

exports.wallet_dir = wallet_dir;

exports.node_status_file = path.join(wallet_dir, 'node_status.txt');

exports.getSecret = function() {
  const file = path.join(wallet_dir, '.api_secret');
  if (fs.existsSync(file)) {
    return fs.readFileSync(file).toString().trim();
  }
  return '';
}

exports.backUpSeed = function() {
  if (fs.existsSync(seedFile)) {
    const bak = path.join(wallet_dir, `wallet_data/wallet.seed.bak.${Date.now()}`);
    fs.renameSync(seedFile, bak)
  }
}

exports.seedExists = function() {
  return fs.existsSync(seedFile);
}
