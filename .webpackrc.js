'use strict';
const path = require('path');
const webpack = require('webpack');

const svgDirs = [
  //require.resolve('antd-mobile').replace(/warn\.js$/, ''),  // 1. 属于 antd-mobile 内置 svg 文件
  path.resolve(__dirname, 'src/assets/system'),
  // path.resolve(__dirname, 'src/my-project-svg-foler'),  // 2. 自己私人的 svg 存放目录
];
// let server = 'http://otc.bdeals.btcex.center:8000/';
// let server = 'http://127.0.0.1:7001/';

// let server = 'http://127.0.0.1:7001/';
let server = 'http://192.168.0.158:7001/';
// if (process.env.local) {
//   server = 'http://127.0.0.1:7003/';
// }

const proxy = {
  target: server,
  changeOrigin: true,
  secure: false,
};

export default {
  "outputPath": "./app/dist",
  es5ImcompatibleVersions: true,
  "externals": {
    "react": "window.React",
    "react-dom": "window.ReactDOM"
  },
  "theme": "./src/theme.js",
  "extraBabelPlugins": [
    ["import", { "libraryName": "antd", "libraryDirectory": "es", "style": true }]
  ],
  alias: {
    debug: require.resolve('debug/src/browser.js'),
    'config': path.join(__dirname, './src/common/config'),
    'storage': path.join(__dirname, './src/common/storage'),
    'common': path.join(__dirname, './src/common'),
    "apis": path.join(__dirname, './src/common/apis'),
    eventBus: path.join(__dirname, './src/common/eventBus'),

    "i18n": path.join(__dirname, './src/common/i18n'),
    'src': path.join(__dirname, './src'),
    "utils": path.join(__dirname, './src/utils'),
    "components": path.join(__dirname, './src/components'),
    "mixins": path.join(__dirname, './src/mixins'),
    'assets': path.join(__dirname, './src/common/assets'),
    ws: path.join(__dirname, './src/common/ws'),
    // i18n: path.join(__dirname, './src/i18n'),
  },
  proxy: {
    '/api.json': proxy,
    '/upload.json': proxy,
    '/exchange/api.json': {
      target: 'http://127.0.0.1:7002',
      changeOrigin: true,
      secure: false,
    },
    '/public/*': {
      target: 'http://ws.bdeals.btcex.center:7004',
    },
  }
}
