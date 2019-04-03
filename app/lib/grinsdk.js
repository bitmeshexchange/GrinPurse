'use strict';
const Base = require('sdk-base');
const urllib = require('urllib');
const BN = require('bignumber.js');
const log = require('./log');

module.exports = class GrinWallet extends Base {
  constructor(options={}) {
    super({
      initMethod: 'init',
    });
    const nodePort = options.nodePort || 3413;
    const ownerPort = options.port || 3420;
    const foreignPort = options.foreignPort || 3420;
    const grinHost = options.grinHost || 'http://127.0.0.1';
    this.api = `${grinHost}:${ownerPort}/v1/wallet/owner`;
    this.nodeAPI = `${grinHost}:${nodePort}/v1`;
    this.username = 'grin';
    this.password = options.password;

    this.walletOwnerApiHost = `${grinHost}:${ownerPort}`;
    this.walletForeignApiHost = `${grinHost}:${foreignPort}`;

    this.receiveUrl = `${grinHost}:${foreignPort}/v1/wallet/foreign/receive_tx`;
  }

  async request(path, data, method='GET') {
    return this._request(path, data, method, this.api);
  }

  async _request(path, data, method='GET', api) {
    try {
      const res = await urllib.request(`${api}${path}`, {
        method,
        data,
        contentType: 'json',
        dataType: 'json',
        auth:`${this.username}:${this.password}`,
        timeout: '60s',
      });
      return res.data;
    } catch (err) {
      log(err.stack);
    }
  }

  async init() {
    await this.queryTotal();
  }

  async queryBlockStatus() {
    const data = await this._request('/status', {}, null, this.nodeAPI);
    return data;
  }

  async queryTx(txid) {
    const data = await this.request(`/retrieve_txs?tx_id=${txid}&&refresh=true`);
    if (!data) {
      return;
    }
    const txs = data[1];
    if (!txs) {
      return null;
    }
    return txs;
  }

  async queryTxList(txid) {
    const data = await this.request(`/retrieve_txs?refresh=true`);
    if (!data) {
      return;
    }
    const txs = data[1];
    if (!txs) {
      return null;
    }
    return txs;
  }

  async queryTotal() {
    const ret = await this.request('/retrieve_summary_info?refresh');
    const data = ret[1];
    return data;
  }

  async queryUtxo() {
    const data = await this.request('/retrieve_outputs', {
      refresh: true,
      show_spent: true,
    });
    return data;
  }

  async postTx(tx) {
    const res = await urllib.request(`${this.api}/post_tx`, {
      content: JSON.stringify(tx),
      method: 'POST',
      dataType: 'json',
      auth:`${this.username}:${this.password}`,
    });
    return res.data;
  }

  async finalize(tx) {
    const res = await urllib.request(`${this.api}/finalize_tx`, {
      content: JSON.stringify(tx),
      method: 'POST',
      dataType: 'json',
      auth:`${this.username}:${this.password}`,
    });
    await this.postTx(res.data);
    return res.data;
  }

  async cancelTx(txid) {
    const data = await this.request(`/cancel_tx?tx_id=${txid}`, null, 'POST');
    return data;
  }

  async receiveTx(tx) {
    if (!(tx && tx.id)) {
      return false;
    }
    const res = await urllib.request(this.receiveUrl, {
      content: JSON.stringify(tx),
      method: 'POST',
      dataType: 'json',
      auth:`${this.username}:${this.password}`,
    });
    const data = res.data;
    return data;
  }

  async createSend({amount, message}) {
    const transfer_amount = BN(amount).times(1e9).toNumber();
    const total = await this.queryTotal();
    const available = total.amount_currently_spendable;
    if (transfer_amount >= available) {
      log(`${amount}, 钱包可用余额不足(${available})`);
      return {
        success: false,
        code: 100,
      }
    }

    const data = await this.request('/issue_send_tx', {
      amount: transfer_amount,
      minimum_confirmations: 1,
      num_change_outputs: 1,
      method: 'file',
      dest: 'test.tx',
      message: message || '',
      max_outputs: 500,
      selection_strategy_is_use_all: false,
    }, 'POST');
    return data;
  }

  async sendTx({amount, dest, message}, bizId) {
    const transfer_amount = BN(amount).times(1e9).toNumber();
    const total = await this.queryTotal();
    const available = total.amount_currently_spendable;
    if (transfer_amount >= available) {
      return {
        success: false,
        code: 100,
      }
    }

    const key = `sendTx_${bizId}`;

    let data;
    try {
      data = await this.request('/issue_send_tx', {
        amount: transfer_amount,
        dest,
        minimum_confirmations: 1,
        num_change_outputs: 1,
        method: 'http',
        max_outputs: 500,
        selection_strategy_is_use_all: false,
        message:  message || String(bizId),
      }, 'POST');
    } catch (err) {
      // 15分钟内不允许再发送
      return {
        success: false,
      }
    }

    const txid = data && data.id;
    try {
      const ret = await this.postTx(data);
      return data;
    } catch (err) {
      err.message = `业务id ${bizId}, txid ${txid} 调用打币接口失败, ${err.message}`;
      throw err;
    }
  }
}
