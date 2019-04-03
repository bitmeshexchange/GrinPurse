const crypto = require('crypto');
const ecies = require('./ecies');
const assert = require('assert');
const ECPair = require('./ecpair');
const createECDH = require('./createECDH');

const options = {
    hashName: 'sha256',
    hashLength: 32,
    macName: 'sha256',
    macLength: 32,
    curveName: 'secp256k1',
    symmetricCypherName: 'aes-256-ecb',
    iv: null, // iv is used in symmetric cipher, set null if cipher is in ECB mode.
    keyFormat: 'uncompressed',
    s1: null, // optional shared information1
    s2: null // optional shared information2
}

exports.encrypt = function(publicKey, message) {
  // console.log(publicKey, publicKey.toString('hex'));
  return ecies.encrypt(publicKey, message, options);
}

exports.decrypt = function(privateKey, message) {
  const ecdh = createECDH(options.curveName);
  ecdh.setPrivateKey(privateKey);
  return ecies.decrypt(ecdh, message, options);
}
