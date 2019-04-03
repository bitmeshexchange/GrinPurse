'use strict';
// import EventEmitter from 'eventemitter3';
// const eventBus = new EventEmitter();
import eventBus from './eventBus';
import { getParameterFromUrl } from './utils';
const MAX = Math.pow(2, 31);


class WebSocketApi {
  constructor(options={}) {
    this.market = options.market;
    this.id = 1;
    this.token = getParameterFromUrl('token') || '';
    this.port = getParameterFromUrl('port') || 8989;
    // this.baseUrl = 'ws://192.168.0.141:8989/';
    this.baseUrl = `ws://127.0.0.1:${this.port}/?token=${this.token}`;
    // this.baseUrl = `ws://192.168.0.141:${this.port}/?token=${this.token}`;
    this._queue = [];
    this.run();
  }

  on(topic, listener) {
    eventBus.on(topic, listener);
  }
  run() {
    this.init();
  }

  init() {
    const ws = new WebSocket(this.baseUrl);
    ws.onmessage = function (event) {
      const message = event.data;
      try {
        let data = JSON.parse(message);
        // console.log(data);
        const type = data[0];
        if (/^\d+$/.test(type)) {
          eventBus.emit(`response${type}`, data[1]);
        } else {
          eventBus.emit(type, data[1]);
        }
      } catch(err) {
        console.log(message);
        console.log(err);
      }
    }

    ws.onopen = () => {
      for (let data of this._queue) {
        this._send(data);
      }
      this._queue = [];
      eventBus.emit('network_connected');
    }

    ws.onerror = () => {
      eventBus.emit('network_disconnected');
    }

    ws.onclose =  () => {
      setTimeout(() => {
        this.init();
      }, 3000);
      eventBus.emit('network_disconnected');
    };

    this.ws = ws;
  }

  getRequestId() {
    let id = this.id++;
    if (this.id > MAX) {
      this.id = 0;
    }
    return id;
  }

  _send(data) {
    const ws = this.ws;
    if (ws.readyState === 1) {
      ws.send(JSON.stringify(data));
    } else {
      this._queue.push(data);
    }
  }

  subscribe(method, params) {
    const data = [0, method, params || []]
    this._send(data);
  }

  call(method, params) {
    const rid = this.getRequestId();
    const data = [rid, method, params || []];
    this._send(data);

    return new Promise(resolve => {
      eventBus.once(`response${rid}`, res => {
        resolve(res);
      });
    });
  }


  ping() {
    return this.call('ping');
  }

  queryBalance() {
    return this.call('queryBalance', []);
  }

  getAddress() {
    return this.call('getAddress', []);
  }

  transfer({address, amount, memo, password}) {
    return this.call('transfer',[address, amount, memo, password]);
  }

  queryTransactions () {
    return this.call('queryTransactions',[]);
  }

  createWallet({password}) {
    return this.call('createWallet',[password]);
  }

  queryWallet() {
    return this.call('queryWallet');
  }

  login({ password }) {
    return this.call('login', [password]);
  }

  createMnemonic({ password }) {
    return this.call('createMnemonic',[ password ]);
  }

  importWallet({ password, mnemonic }) {
    return this.call('importWallet',[ password, mnemonic ]);
  }

  checkWallet() {
    return this.call('checkWallet',[ ]);
  }

  cancelTx({ txId }) {
    return this.call('cancelTx', [ txId ]);
  }
  fetchExchange() {
    return this.call('fetchExchange');
  }
}


export default new WebSocketApi();
