'use strict';
const bs58 = require('bs58check');
const urllib = require('urllib');
const prefix = 'GP';

exports.getAddress = function getAddress(pubkey) {
  return prefix + bs58.encode(exports.toBuffer(pubkey).slice(0, 24));
}

exports.isValidGPAddress = function(address) {
  if (!(address && address.toString().startsWith(prefix))) {
    return false
  }
  try {
    bs58.decode(address.replace(prefix, ''));
    return true;
  } catch (err) {
    return false;
  }
}


exports.isAddressReachable = async function(address) {
  if (!address) {
    return false;
  }
  if (!address.startsWith('http')) {
    return false;
  }

  const res = await urllib.request(address);
  const status = res.status;
  return status === 200 || status === 404 || status === 302;
}

exports.toBuffer = function (buf) {
  if (!Buffer.isBuffer(buf)) {
    return Buffer.from(buf, 'hex');
  }
  return buf;
}
