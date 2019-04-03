'use strict';
const Base = require('sdk-base');
const PaymentChannel = require('./payment_channel');

class ChannelManager extends Base {
  constructor() {
    super();
    this.channels = {};
  }

  createChannel(address, key) {
    if (this.channels[address]) {
      return this.channels[address];
    }
    const channel = new PaymentChannel({
      address,
      key,
    });
    this.channels[address] = channel;
    return channel;
  }
}

module.exports = new ChannelManager();
