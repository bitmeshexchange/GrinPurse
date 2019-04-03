'use strict';
const Base = require('sdk-base');
const crypto = require('crypto');
const assert = require('assert');
const {getAddress, toBuffer} = require('./utils');
const eccrypto = require('../crypto/eccrypto');
const msgpack = require('msgpack5')();
const {sha256} = require('utility');
const Cutter = require('cutter');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const WebSocket = require('ws');
const cons = require('./const');

function packetLength(header) {
  const bodyLen = header.readInt32BE(0);
  return header.length + bodyLen;
}

module.exports = class Peer extends Base {
  constructor(options) {
    super({
      initMethod: 'init',
    });
    this.nodes = {};
    this.publicKey = options.publicKey;
    this.privateKey = options.privateKey;

    this.key = ec.keyFromPrivate(options.privateKey);

    this.address = getAddress(this.publicKey);
    this.options = options;

    console.log(this.address);
    this.rid = 0;
  }

  async init() {
    await this.connect();
    this.on('m', (message) => {
      this.handlePeerMessage(message[0], message[1]);
    });
    this.ready(true);
  }

  handlePeerMessage(from, buf) {
    try {
      const data = msgpack.decode(this.decrypt(buf));
      const pubkey = toBuffer(from);
      const addr = getAddress(pubkey);
      this.nodes[addr] = {
        pubkey,
        t: Date.now(),
      }
      const [action, message] = data;
      // receive a slate
      if (action === cons.send_slate) {
        this.emit(cons.receive_slate, addr, message);
      } else if (action === cons.send_slate_back) {
        this.emit(`on_transaction_response_${message.id}`, addr, message);
      }
    } catch (err) {

    }
  }

  async connect() {
    const pubkey = this.publicKey.toString('hex');
    const sig = this.key.sign(this.getSignHash()).toDER('hex');

    const socketUrl = `ws://gp.bitmesh.com/?pubkey=${pubkey}&sig=${sig}`;
    const ws = new WebSocket(socketUrl);
    let timer = setInterval(() => {
      try {
        ws.ping();
      } catch (err) {

      }
    }, 50 * 1e3);

    this.ws = ws;
    let inited = false;
    return new Promise(resolve => {
      ws.on('error', err => {
        console.log(err);
      }).on('message', message => {
        process.emit('node_status', {
          connected: true,
        });

        message = msgpack.decode(message);
        if (message === 'OK') {
          if (!inited) {
            inited = true;
            this.emit('connected');
          }
          return resolve(true);
        }
        this.handleMessage(message);
      }).on('close', () => {
        process.emit('node_status', {
          connected: false,
        });

        clearInterval(timer);
        this.ws = null;
        setTimeout(() => {
          this.connect();
        }, 5 * 1e3);
      });
    });
  }

  handleMessage(message) {
    const [rid, data] = message;
    if (/^\d+$/.test(rid)) {
      return this.emit(`response_${rid}`, data);
    }
    this.emit(rid, data);
  }

  send(message) {
    if (this.ws) {
      try {
        this.ws.send(msgpack.encode(message));
        return true;
      } catch (err) {
        return false;
      }
    }
    return false;
  }

  callMethod(method, args) {
    const rid = this.rid++;
    this.send([rid, method, args]);
    return new Promise(resolve => {
      this.once(`response_${rid}`, resolve);
    });
  }

  async queryNode(address) {
    if (this.nodes[address]) {
      return this.nodes[address].pubkey;
    }

    let node = await this.callMethod('q', [address]);
    if (!node) {
      return;
    }

    node = toBuffer(node);
    if (getAddress(node) === address) {
      this.nodes[address] = {
        pubkey: node,
        t: Date.now(),
      }
      return node;
    }
  }

  getSignHash(publicKey=this.publicKey) {
    const address = getAddress(publicKey);
    return Buffer.from(address).slice(0, 32);
  }

  async sendTo(address, message) {
    const node = await this.queryNode(address);
    if (!node) {
      return false;
    }
    const buf = this.encrypt(node, message);
    this.callMethod('s', [address, buf]);
  }

  encrypt(publicKey, message) {
    assert(publicKey && Buffer.isBuffer(publicKey), `invalid publicKey ${publicKey}`);
    return eccrypto.encrypt(publicKey, msgpack.encode(message));
  }

  decrypt(enc) {
    try {
      return eccrypto.decrypt(this.privateKey, enc);
    } catch (err) {
      console.log(err.stack);
      return null;
    }
  }
}
