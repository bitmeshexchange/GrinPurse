'use strict';
const path = require('path');
const Base = require('sdk-base');
const { exec, spawn } = require('child_process');
const GrinWalletSdk = require('./lib/grinsdk');
const GrinRs = require('./lib/grin_rs');
const bip39 = require('bip39');
const config = require('./lib/config');
const log = require('./lib/log');
const execPath = require('./bin')('grin');
let walletPro = null;
let running = true;

function startWalletProcess(password) {
  let ret = false;
  log(`wallet execPath is ${execPath}`);
  function run(resolve) {
    resolve = resolve || function() {};
    const cmd = exec(`${execPath} wallet  --pass=${password} owner_api`);

    walletPro = cmd;
    setTimeout(() => {
      if (!ret) {
        log('wallet api started');
        resolve(true);
      }
    }, 5 * 1e3);

    cmd.stdout.on('data', (data) => {
      log(data);
      if (data.indexOf('check provided password') > -1) {
        ret = true;
        resolve(false);
      } else {
        if (!ret) {
          resolve(true);
        }
      }
    });

    cmd.stderr.on('data', (data) => {
      console.log(`stderr: ${data}`);
    });

    cmd.on('exit', (code) => {
      log(`wallet exit with code ${code}`);
      if (running) {
        // setTimeout(() => {
        //   log('wallet server exit, restarting ...');
        //   run();
        // }, 5 * 1000);
      }
    });
  }

  return new Promise(resolve => {
    run(resolve);
  });
}

function recoverWallet(phrase, password) {

  return new Promise(resolve => {
    config.backUpSeed();

    const cmd = spawn(execPath, ['wallet', 'recover'], {
      env:{
        password,
        phrase: phrase,
      }
    });

    cmd.stdout.on('data', (data) => {
      data = data.toString();
      if (data.indexOf(`'recover' completed successfully`) > -1) {
        return resolve(true);
      }

      if (data.indexOf('Error recovering seed') > -1) {
        resolve(false);
      }
    });
  });
}

function checkWallet(password, fn) {
  return new Promise(resolve => {
    const cmd = exec(`${execPath} wallet  --pass=${password} check`);
    let flag = false;
    cmd.stdout.on('data', (data) => {
      data = data.toString();
      if (data.indexOf('decrypting wallet seed') > -1) {
        flag = true;
        return resolve(false);
      }
      log(data);
      if (fn) {
        fn(data);
      }
    });

    cmd.on('close', (code) => {
      if (!flag) {
        resolve(true);
      }
    });
  });
}

let sdk = null;

function updateHeight() {
  const height = sdk.getNodeHeight();
  if (height) {
    process.emit('node_status', {
      current_height: height,
    });
  }
}

exports.recoverWallet = recoverWallet;
exports.checkWallet = checkWallet;
exports.getWalletSdk = async function getWalletSdk(password) {
  if (sdk) {
    return sdk;
  }
  const mnemonic = GrinRs.get_wallet_phrase(password);
  const result = bip39.validateMnemonic(mnemonic);

  if (result) {
    sdk = new GrinRs({
      password,
    });
    updateHeight();
    setInterval(() => {
      updateHeight();
    }, 8 * 1e3);
    return sdk;
  }
  return null;
}

exports.stopWallet = function() {
  running = false;
  if(walletPro) {
    walletPro.kill();
  }
}
