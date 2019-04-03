'use strict';
const path = require('path');
const {wallet_dir} = require('./config');
const dbpath = path.join(wallet_dir, 'grinpurse/tx_address.db');

const Datastore = require('nedb');
const db = new Datastore({ filename: dbpath, autoload: true });

db.fetchAll = function() {
  return new Promise(resolve => {
    db.find({}, function (err, docs) {
      resolve(docs);
    });
  });
}

module.exports = db;
