'use strict';
const grin = require('./index.node');
const BN = require('bignumber.js');
const config = require('./config');
const tempDir = require('temp-dir');
const path = require('path');
const fs = require('fs');
const log = require('./log');
const defaultNode = 'http://127.0.0.1:3413';
const scale = 1e9;
const defaultFee = 0.008 * 1e9;

module.exports = class GrinSdk {
  constructor(options) {
    this.wallet_dir = options.wallet_dir || config.wallet_dir;
    this.password = options.password;
    this.node_api = options.node_api || defaultNode;
  }

  static get_wallet_phrase(password) {
    return grin.get_wallet_phrase(config.wallet_dir, password, defaultNode);
  }

  static wallet_recovery(password, phrase) {
    return grin.wallet_recovery(config.wallet_dir, phrase, password, defaultNode);
  }

  static wallet_check(password) {
    return grin.wallet_check(config.wallet_dir, password, defaultNode);
  }

  async queryTxList() {
    const txs = grin.query_tx_list(this.wallet_dir, this.password, this.node_api);
    const data = JSON.parse(txs);
    return data[1];
  }

  async queryTotal() {
    console.log(this.wallet_dir);
    const balance = grin.balance(this.wallet_dir, this.password, this.node_api);
    return JSON.parse(balance);
  }

  async createSend({amount, message}) {
    const transfer_amount = BN(amount).times(scale).toNumber();
    const total = await this.queryTotal();
    const available = total.amount_currently_spendable;
    if (transfer_amount >= available + defaultFee) {
      log(`${amount}, insufficient balance(${available})`);
      return {
        success: false,
        code: 100,
      }
    }

    message = message || '';
    log(`start to create transaction with ${amount} GRINS`);
    let tx = grin.create_transaction(this.wallet_dir, this.password, this.node_api, message, transfer_amount);
    try {
      const data = JSON.parse(tx);
      log(`transaction created, txid is ${data.id}`);
      return data;
    } catch (err) {
      log(`create transaction failed ${tx}`);
      return null;
    }
  }

  async cancelTx(id) {
    const ret = grin.cancel_transaction(this.wallet_dir, this.password, this.node_api, id);
    if (ret && ret.indexOf('cannot') > -1) {
      return false;
    }
    return true;
  }


  async deleteTx(id) {
    const ret = grin.delete_transaction(this.wallet_dir, this.password, this.node_api, id);
    return ret;
  }

  async receiveTx(tx) {
    if (!(tx && tx.id)) {
      return false;
    }
    const slate_file = path.join(tempDir, tx.id);
    fs.writeFileSync(slate_file, JSON.stringify(tx));
    log(`receive transaction`);
    const res = grin.receive_transaction(this.wallet_dir, this.password, this.node_api, slate_file);
    try {
      return JSON.parse(res);
    } catch (err) {
      log(`receive_transaction error ${res}`);
      return null;
    }
  }

  async queryTx(txid) {
    const res = grin.query_transaction(this.wallet_dir, this.password, this.node_api, txid);
    if (res === 'error txid') {
      return null;
    }
    try {
      const data = JSON.parse(res);
      if (data[1] && data[1].length) {
        return data[1][0];
      }
    } catch (err) {
      return null;
    }
  }

  getNodeHeight() {
    const res = grin.node_height(this.wallet_dir, this.password, this.node_api);
    try {
      const data = JSON.parse(res);
      return data[0];
    } catch (err) {
      log(`get node height, ${err.stack} ${res}`);
    }
  }

  async finalize(tx) {
    if (!(tx && tx.id)) {
      return false;
    }
    const slate_file = path.join(tempDir, tx.id);
    fs.writeFileSync(slate_file, JSON.stringify(tx));
    const res = grin.finalize_transaction(this.wallet_dir, this.password, this.node_api, slate_file);
    log(`receive_transaction error ${res}`);
    return res;
  }
}
