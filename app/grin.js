'use strict';
const log = require('./lib/log');
const crypto = require('crypto');
const homedir = require('homedir-polyfill')();
const path = require('path');
const getPort = require('get-port');
const fs = require('fs');
const urllib = require('urllib');
const env = process.env;
const {getAddress, isValidGPAddress, isAddressReachable} = require('./lib/utils');
const HDNode = require('./crypto/hdnode');
const WebSocket = require('ws');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const bip39 = require('bip39');
const qs = require('querystring');
const mkdirp = require('mkdirp');
const child_process = require('child_process');
const walletFile = path.join(__dirname, 'wallet.js');
const {seedExists, node_status_file} = require('./lib/config');
const {getWalletSdk, recoverWallet, checkWallet, stopWallet} = require('./wallet');
const GrinRs = require('./lib/grin_rs');
const WsPeer = require('./lib/ws_peer');
const {sha256} = require('utility');
const cons = require('./lib/const');
const db = require('./lib/db');
const {port, token} = process.env;
const exchange = require('./lib/exchange');

log('grin process started');

async function run(options={}) {
  const app = options.app;
  const port = 3413;

  const wallet_dir = path.join(homedir, `.grin/main`);
  const seed_dir = path.join(wallet_dir, 'wallet_data');
  mkdirp.sync(seed_dir);
  fs.writeFileSync(node_status_file, '');

  if (process.send) {
    process.send('start');
  }
  let lastStatus;

  let address = '';
  let password = null;
  let inited = false;
  let key = null;

  let peer;
  function init(password) {
    if (inited) {
      return false;
    }
    inited = true;
    const mnemonic = GrinRs.get_wallet_phrase(password); //bip39.generateMnemonic(160);
    const seed = bip39.mnemonicToSeedHex(mnemonic);
    const root = HDNode.fromSeedHex(seed);
    const node = root.derivePath(`m/1/1`);

    key = {
      sign: node.sign.bind(node),
      verify: node.verify.bind(node),
      publicKey: node.getPublicKeyBuffer(),
      privateKey: node.getPrivateKeyBuffer(),
    };

    address = getAddress(node.getPublicKeyBuffer());

    peer = new WsPeer(key);

    peer.on('connected', () => {
      log(`connected to remote WebSocket server`);
    });

    peer.on(cons.receive_slate, async (addr, slate) => {
      log(`receive a slate from ${addr}`);
      const sdk = await getWalletSdk(password);
      const data = await sdk.receiveTx(slate);
      // channel.sendTxBack(data, peer);
      peer.sendTo(addr, [
        cons.send_slate_back, data
      ]);

      broadcast(['receiving', {
        amount: data.amount/1e9,
        address: addr,
      }]);

      const record = {
        address: addr,
        txid: slate.id,
      };

      db.insert(record, function (err, newDoc) {
        if (err) {
          log(`address db insert error ${err.toString()}`);
        }
      });
    });

    console.log(`your address is ${address}`);
  }

  const api = {
    getAddress() {
      return address;
    },

    async queryBalance() {
      if (!password) {
        return false;
      }
      const sdk = await getWalletSdk(password);
      return await sdk.queryTotal();
    },

    async queryWallet() {
      const exist = seedExists();
      return {
        exist,
        wallet_dir,
        login: !!password,
      }
    },

    async startSync() {

    },

    async createMnemonic() {
      return bip39.generateMnemonic(160);
    },

    async login(pass) {
      const sdk = await getWalletSdk(pass);
      if (sdk) {
        password = pass;
        init(password);
      }
      return !!sdk;
    },

    async importWallet(pass, mnemonic) {
      if (!bip39.validateMnemonic(mnemonic)) {
        return false;
      }

      const ret = GrinRs.wallet_recovery(pass, mnemonic);
      password = pass;
      init(password);
      return ret;
    },

    async checkWallet() {
      if (password) {
        // return await checkWallet(password);
        const ret = GrinRs.wallet_check(password);
        console.log(ret);
        return ret;
      }
      return false;
    },

    async cancelTx(id) {
      if (!password) {
        return false;
      }
      const sdk = await getWalletSdk(password);
      return await sdk.cancelTx(id);
    },

    async transfer(address, amount, message='', pass) {
      if (!password) {
        return 401;
      }

      if (pass !== password) {
        return 405;
      }

      if (!address) {
        return 400;
      }

      if (!address.startsWith('http') && !isValidGPAddress(address)) {
        return 402;
      }

      let isHttp = false;

      if (address.startsWith('http')) {
        const reachable = await isAddressReachable(address);
        if (!reachable) {
          log(`address ${address} not reachable`);
          return 403;
        }
        isHttp = true;
      } else {
        const node = await peer.queryNode(address);
        if (!node) {
          return 504;
        }
      }

      log(`prepare to create a transaction, address is ${address}, amount is ${amount}`);
      const sdk = await getWalletSdk(password);
      const slate = await sdk.createSend({amount, message});
      const id = slate && slate.id;

      if (!(id)) {
        return 500;
      }

      log(`get slate ${id}`);

      function insertDb() {
        const record = {
          address,
          txid: id,
        };
        db.insert(record, function (err, newDoc) {
          if (err) {
            log(`address db insert error ${err.toString()}`);
          }
        });
      }

      if (isHttp) {
        if (address.endsWith('/')) {
          address = address.slice(0, -1);
        }

        try {
          const res = await urllib.request(`${address}/v1/wallet/foreign/receive_tx`, {
            method: 'post',
            dataType: 'json',
            timeout: '10s',
            content: JSON.stringify(slate),
          });

          if (res && res.data && res.data.id === slate.id) {
            insertDb();
            log(`post transaction ok, start to finalize transaction ${id}`);
            sdk.finalize(res.data);
            return true;
          }

          log(`post transaction failed ${id}`);
          const transaction = await sdk.queryTx(id);
          if (transaction && transaction.id) {
            await sdk.cancelTx(transaction.id);
          }
          return false;
        } catch (err) {
          log(err.stack);
          const transaction = await sdk.queryTx(id);
          if (transaction && transaction.id) {
            await sdk.cancelTx(transaction.id);
          }
          return 505;
        }
      }

      peer.once(`on_transaction_response_${id}`, (addr, slate) => {
        log(`receive slate response, start to finalize transaction ${id}`);
        sdk.finalize(slate);
      });
      // 发送交易
      await peer.sendTo(address, [
        cons.send_slate, slate,
      ]);
      insertDb();
      return true;
    },

    async queryTransactions() {
      if (!password) {
        return [];
      }
      const sdk = await getWalletSdk(password);
      const addresses = await db.fetchAll();
      const txs =  await sdk.queryTxList();
      let addressMap = {};
      if (addresses && addresses.length) {
        addresses.map(item => {
          addressMap[item.txid] = item.address;
        });
      }

      if (txs && txs.length) {
        txs.map(item => {
          item.address = addressMap[item.tx_slate_id] || '';
        });
      }
      return txs;
    },

    async fetchExchange () {
      return await exchange();
    }
  }

  const wss = new WebSocket.Server({
    port: options.port || 8989,
  });

  function broadcast(message) {
    wss.clients.forEach(ws => {
      if (ws.readyState === 1) {
        ws.send(JSON.stringify(message));
      }
    });
  }

  wss.on('connection',  async (ws, req) =>  {
    const query = qs.parse(req.url.split('?')[1]);

    if (query.token !== options.token) {
      // return ws.terminate();
    }

    function send(data) {
      if (ws.readyState === 1) {
        ws.send(JSON.stringify(data));
      }
    }

    ws.on('message',  async (message) => {
      const data = JSON.parse(message);
      const type = parseInt(data[0]);
      if (type === 0) {

      } else {
        const method = data[1];
        const params = data[2];
        if (api[method]) {
          const data = await api[method].apply(api, params);
          send([type, {
            success: true,
            data,
          }]);
        }
      }
    });

    setInterval(async () => {
      try {
        if (password) {
          const sdk = await getWalletSdk(password);
          const balance = await sdk.queryTotal();
          send([
            'balance',
            balance,
          ]);
        }
      } catch (err) {
        console.log(err);
      }
    }, 5000);

    function updateStatus(status) {
      lastStatus = status;
      send([
        'status',
        status,
      ]);
    }

    if (lastStatus) {
      send([
        'status',
        lastStatus,
      ]);
    }

    function log_message(message) {
      send(['log', message]);
    }

    process.on('node_status', updateStatus);
    process.on('log_message', log_message);
    ws.on('close', () => {
      process.removeListener('node_status', updateStatus);
      process.removeListener('log_message', log_message);
    });
  });
}

module.exports = run;

if (process.env.start) {
  run({
    port: process.env.port,
    token: process.env.token,
  });
}
