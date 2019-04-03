'use strict';
const Swarm = require('discovery-swarm');
const defaults = require('dat-swarm-defaults');
const getPort = require('get-port');
const SdkBase = require('sdk-base');
const assert = require('assert');
const crypto = require('crypto');
const eccrypto = require('../crypto/eccrypto');
const {sha256} = require('utility');
const msgpack = require('msgpack5')();
const bs58 = require('bs58');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const Cutter = require('cutter');
const uuid = require('uuid/v4');
const {getAddress} = require('./utils');
const log = require('./log');
// 
function packetLength(header) {
  const bodyLen = header.readInt32BE(0);
  return header.length + bodyLen;
}

class PaymentChannel extends SdkBase {
  constructor(options={}) {
    assert(options.address, 'address is required');
    assert(options.key, 'key is required');
    super({
      initMethod: 'init',
    });
    this.options = options;
    this.key = options.key;
    this.publicKey = options.key.publicKey;
    this.privateKey = options.key.privateKey;

    this.address = getAddress(this.publicKey);
    console.log(this.address);
    this.targetPeer = null;

    this.peers = {};
  }

  encrypt(publicKey, message) {
    assert(publicKey && Buffer.isBuffer(publicKey), `invalid publicKey ${publicKey}`);
    return eccrypto.encrypt(publicKey, message);
  }

  decrypt(enc) {
    try {
      return eccrypto.decrypt(this.privateKey, enc);
    } catch (err) {
      log(err.stack);
      return null;
    }
  }

  isSender() {
    return this.address !== this.options.address;
  }

  getAddressHash() {
    return Buffer.from(this.options.address).slice(0, 32);
  }

  getSignHash() {
    return Buffer.from(sha256(this.options.address), 'hex').slice(0, 32);
  }

  async init() {
    const config = defaults({
      id: this.publicKey,
    });

    const port = await getPort();
    const sw = Swarm(config);
    sw.listen(port);

    const topic = sha256(this.options.address.slice(2));

    sw.join(topic);

    sw.on('connection', (conn, info) => {
      this.handleConnection(conn, info);
    });
  }

  broadcast(data) {
    const peers = this.peers;
    for (let id in peers) {
      this.send(peers[id], data);
    }
  }

  async send(peer, data, encrypt=true) {
    const {conn, publicKey} = peer;
    try {
      const buf = msgpack.encode(data);
      let body = buf;
      if (encrypt) {
        body = this.encrypt(publicKey, buf);
      }

      const header = new Buffer(8);
      header.writeInt32BE(body.length, 0);
      header.writeInt32BE(encrypt ? 1 : 0, 4);
      peer.conn.write(Buffer.concat([header ,body]));
    } catch (err) {
      log(err.stack);
    }
  }

  async handleData(buf, peer, encrypted) {
    if (encrypted) {
      buf = this.decrypt(buf);
    }

    const data = msgpack.decode(buf);
    const action = data.action;

    if (action === 'verify') {
      log(`Received verify message from ${peer.id}`);
      const key = ec.keyFromPublic(peer.publicKey.toString('hex'), 'hex');
      const valid = key.verify(this.getSignHash(), Buffer.from(data.sig,'hex'));

      if (valid) {
        this.targetPeer = peer;
        log(`payment channel is opened on the ${this.isSender() ? 'sender' : 'receiver'} side`);
        this.emit('opened', peer);
      } else {
        log(`Signature from ${peer.id} is invalid`);
        peer.conn.close();
      }
    } else if (action === 'send') {
      // 接收slate
      log(`Received slate from ${peer.id}`);
      this.emit('on_transaction_recived', data.slate, peer);
    } else if (action === 'response') {
      log(`Received slate response from ${peer.id}`);
      this.emit(`on_transaction_response_${data.slate.id}`, data.slate, peer);
    }
  }

  sendTxBack(slate, peer) {
    this.send(peer, {
      action: 'response',
      slate,
    });
  }

  awaitOpenChannel(timeout=0) {
    return new Promise(resolve => {
      if (this.targetPeer) {
        return resolve(this.targetPeer);
      }

      let timer;
      let flag = false;
      if (timeout) {
        timer = setTimeout(() => {
          if (!flag) {
            flag = true;
            resolve('timeout');
          }
        }, timeout);
      }

      this.once('opened', (peer) => {
        if (!flag) {
          flag = true;
          resolve(peer);
        }
      });
    });
  }

  async sendTx(slate) {
    await this.awaitOpenChannel();
    this.send(this.targetPeer, {
      action: 'send',
      slate,
    });
  }

  handleConnection(conn, info) {
    const peers = this.peers;
    const peerId = getAddress(info.id);
    const cutter = new Cutter(8, packetLength);

    cutter.on('packet', (packet) => {
      const head = packet.slice(0, 8);
      const encrypted = head.readInt32BE(4);
      const body = packet.slice(8, packet.length);
      this.handleData(body, peer, encrypted);
    });

    log(`Connected to peer: ${peerId}`);

    const peer = {
      conn,
      publicKey: info.id,
      id: peerId,
    };

    if (!peers[peerId]) {
      peers[peerId] = peer;
    }
    // Keep alive TCP connection with peer
    if (info.initiator) {
      try {
        conn.setKeepAlive(true, 600);
      } catch (exception) {
        console.log('exception', exception);
      }
    }

    conn.on('data', (message) => {
      cutter.handleData(message);
    });

    conn.on('close', () => {
      delete peers[peerId];
    });

    // 该节点接收付款，向连接的节点证实自己的身份
    if (!this.isSender()) {
      if (!peer.verified) {
        peer.verified = true;
        log('Start to send signature to sender');
        const sig = this.key.sign(this.getSignHash());
        this.send(peer, {
          action: 'verify',
          sig: sig.toDER(),
        }, true);
      }
    } else {

    }
  }
}

module.exports = PaymentChannel;
