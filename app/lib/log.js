'use strict';
'use strict';
const path = require('path');
const winston = require('winston');
const { createLogger, format, transports } = winston;
const { combine, timestamp, label, printf } = format;
const mkdirp = require('mkdirp');
const moment = require('moment');
require('winston-daily-rotate-file');
const {wallet_dir} = require('./config');

const loggers = {};
const logDir = path.join(wallet_dir, 'grinpurse/logs');

mkdirp.sync(logDir);

const logFormat = printf(info => {
  const datetime = moment(info.timestamp).format('YYYY-MM-DD HH:mm:ss');
  return `${datetime} [${info.level}] ${info.message}`;
});

function getLogger(name, options={}) {
  if (loggers[name]) {
    return loggers[name];
  }

  const logger = createLogger({
    level: options.level || 'info',
    format: logFormat,
    transports: [
      new (winston.transports.DailyRotateFile)({
        filename: path.join(logDir, name + '.log'),
        datePattern: 'YYYY-MM-DD',
        zippedArchive: false,
        maxSize: '20m',
        maxFiles: '14d'
      })
    ]
  });

  logger.add(new transports.Console({
    format: logFormat
  }));

  loggers[name] = logger;
  return logger;
}

const logger = getLogger('purse');

process.on('uncaughtException', (err) => {
  logger.info(`process exit with error ${err.stack}`);
  throw err;
});

module.exports = function(message) {
  console.log(message);
  logger.info(message);
  process.emit('log_message', message);
}
