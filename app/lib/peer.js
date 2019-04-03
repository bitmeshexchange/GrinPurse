'use strict';
const Base = require('sdk-base');
const crypto = require('crypto');
const assert = require('assert');
const Swarm = require('discovery-swarm');
const defaults = require('dat-swarm-defaults');
const getPort = require('get-port');
const {getAddress} = require('./utils');
const eccrypto = require('../crypto/eccrypto');
const msgpack = require('msgpack5')();
const {sha256} = require('utility');
const Cutter = require('cutter');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

function packetLength(header) {
  const bodyLen = header.readInt32BE(0);
  return header.length + bodyLen;
}

module.exports = class Peer extends Base {
  constructor(options) {
    super({
      initMethod: 'init',
    });
    this.peers = {};
    this.req = {};
    this.publicKey = options.publicKey;
    this.privateKey = options.privatekey;

    this.key = ec.keyFromPrivate(options.privatekey);
    this.address = getAddress(this.publicKey);
  }

  async init() {
    const config = defaults({
      id: this.publicKey,
    });

    const port = await getPort();
    const sw = Swarm(config);
    sw.listen(port);

    const topic = 'gp.bitmesh.com';

    sw.join(topic);

    sw.on('connection', (conn, info) => {
      this.handleConnection(conn, info);
    });
  }

  async handleData(buf, peer, encrypted) {
    if (encrypted) {
      buf = this.decrypt(buf);
    }

    const message = msgpack.decode(buf);
    const [action, data] = message;
    if (action === 'sig') {
      // 检测签名
      const key = ec.keyFromPublic(peer.publicKey);
      const valid = key.verify(this.getSignHash(peer.publicKey), data);
      if (valid) {
        this.peers[peer.id] = peer;
        console.log(this.peers);
      } else {
        // 签名非法
        peer.conn.close();
      }
    } else if (action === 'find_node') {
      return this.handleFindNode(data, peer);
    } else if (action === 'found') {
      return this.handleFoundNode(data, peer);
    }
  }

  handleFoundNode(data, peer) {
    const [depth, address, result] = data;
    const id = getAddress(result);
    if (id !== address) {
      // 返回的数据错误
      return peer.close();
    }

    if (depth === 0) {
      this.emit(`found_${id}`, result);
    } else {
      const key = `find_node_${id}`;
      if (this.request[key]) {
        this.send(this.request[key], ['found', [0, id, result]], false);
      }
    }
  }

  handleFindNode(data, peer) {
    const depth = data[0];
    const id = data[1];
    const target = this.peers[id];
    if (target) {
      this.send(peer, ['found', [depth, id, target.publicKey]], false);
    } else {
      // 继续转发
      // if (depth < 2) {
      //   this.broadcast([
      //     'find_node',
      //     [depth+1, id]
      //   ], peer);
      //
      //   const key = `find_node_${id}`;
      //   this.request[key] = peer;
      //   setTimeout(() => {
      //     this.request[key] = null;
      //     delete this.request[key];
      //   }, 60 * 1e3);
      // }
    }
  }

  send(peer, data, encrypted = true) {
    const {conn, publicKey} = peer;
    try {
      const buf = msgpack.encode(data);
      const body = encrypted ? this.encrypt(publicKey, buf) : buf;

      const header = new Buffer(8);
      header.writeInt32BE(body.length, 0);
      header.writeInt32BE(encrypted ? 1 : 0, 4);
      peer.conn.write(Buffer.concat([header ,body]));
    } catch (err) {
      console.log(err.stack);
    }
  }

  // 像所有连接节点广播消息
  broadcast(data, exceptPeer) {
    for (let peerId in this.peers) {
      const peer = this.peers[peerId];
      if (peer === exceptPeer) {
        continue;
      }
      this.send(peer, data, false);
    }
  }

  // 根据用户地址查找用户
  async findUser(id) {
    this.broadcast([
      'find_node',
      [0, id],
    ]);
    const key = `found_${id}`;
    return new Promise(resolve => {
      this.once(key, resolve);
      setTimeout(() => {
        this.removeListener(key, resolve);
        resolve();
      }, 30 * 1e3);
    });
  }

  // 像指定用户发送消息
  async sendTo(id, message) {
    const peer = this.peers[id];
    if (peer) {
      this.send(peer, message);
    } else {
      // 广播给所有用户
      const pubkey = await this.findNode(id);
      if (pubkey) {
        const data = this.encrypt(pubkey, message);
        this.broadcast();
      }
    }
  }

  getSignHash(publicKey=this.publicKey) {
    return publicKey.slice(0, 32);
  }

  encrypt(publicKey, message) {
    assert(publicKey && Buffer.isBuffer(publicKey), `invalid publicKey ${publicKey}`);
    return eccrypto.encrypt(publicKey, message);
  }

  decrypt(enc) {
    try {
      return eccrypto.decrypt(this.privateKey, enc);
    } catch (err) {
      console.log(err.stack);
      return null;
    }
  }

  sendSig(peer) {
    const sig = this.key.sign(this.getSignHash());

    this.send(peer, [
      'sig', sig.toDER(),
    ]);
  }

  handleConnection(conn, info) {
    const peerId = getAddress(info.id);
    const cutter = new Cutter(8, packetLength);

    const peer = {
      conn,
      publicKey: info.id,
      id: peerId,
    };

    cutter.on('packet', (packet) => {
      const head = packet.slice(0, 8);
      const encrypted = head.readInt32BE(4);
      const body = packet.slice(8, packet.length);
      this.handleData(body, peer, encrypted);
    });

    conn.on('data', (message) => {
      cutter.handleData(message);
    });

    conn.on('close', () => {
      if (this.peers[peerId]) {
        delete this.peers[peerId];
      }
    });

    this.sendSig(peer);
  }
}
