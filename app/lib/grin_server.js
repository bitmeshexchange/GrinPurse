'use strict';
const { EventEmitter } = require('events');
const { EventEmitter: RustChannel } = require('../../native');
const { promisify } = require('util');

module.exports = class GrinServer extends EventEmitter {
  constructor(options) {
    super();
    const channel = new RustChannel(options.port);

    const poll = promisify(channel.poll.bind(channel));

    this.isShutdown = false;

    const loop = () => {
      if (this.isShutdown) {
        return channel.shutdown();
      }

      // Poll for data
      return (
        poll()
          .then(e => {
            // Timeout on poll, no data to emit
            if (!e) {
              return undefined;
            }

            const { event, ...data } = e;

            // Emit the event
            this.emit(event, data);

            return undefined;
          })

          // Emit errors
          .catch(err => this.emit('error', err))

          // Schedule the next iteration of the loop. This is performed with
          // a `setImmediate` to extending the promise chain indefinitely
          // and causing a memory leak.
          .then(() => setImmediate(loop))
      );
    };
    // Start the polling loop
    loop();
  }

  // Mark the channel for shutdown
  shutdown() {
    this.isShutdown = true;
    return this;
  }
}
