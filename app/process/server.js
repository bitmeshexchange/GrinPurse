'use strict';
const path = require('path');
const child_process = require('child_process');
const port = process.env.port;
const { exec } = require('child_process');
const log = require('../lib/log');
const bin = require('../bin')('grin');
const {node_status_file} = require('../lib/config');

let pro = null;
let running = true;

exports.startNodeServer = function(onStatus) {
  log(`grin node server is starting`);
  pro = exec(`${bin} server run`, {
    env: {
      status_path: node_status_file,
    }
  });
  const prefix = '[stats]';
  pro.stdout.on('data', (data) => {
    data = data.toString().trim();
    if (data.startsWith(prefix)) {
      const status = data.trim().replace(prefix, '').split('|');
      if (status.length === 4) {
          process.emit('node_status', {
            peer_count: status[1],
            block_height: status[2],
            current_height: status[3],
            status: status[0].replace(/["]/g, ""),
          });
        }
    } else {
      log(`[grin server] ${data}`);
    }
  });

  pro.stderr.on('data', data => {
    log(data.toString());
  });

  pro.on('exit', (code, signal) => {
    log(`[grin server] exited with code ${code}`);
    if (running) {
      // setTimeout(() => {
      //   log('[grin server] exit, restarting ...');
      //   exports.startNodeServer();
      // }, 5 * 1000);
    }
  });

  return pro;
}

exports.stopNodeServer = function(callback) {
  running = false;
  if (pro) {
    pro.once('exit', function() {
      if (callback) {
        callback();
      }
    });
    pro.kill('SIGINT');
  }
}
