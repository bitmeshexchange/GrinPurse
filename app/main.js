// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain} = require('electron');
const {startNodeServer, stopNodeServer} = require('./process/server');
const path = require('path');
const getPort = require('get-port');
const grin = require.resolve('./grin');
const child_process = require('child_process');
const { setDefaultApplicationMenu } = require('./menu')
const isDev = process.env.NODE_ENV === 'dev';
const log = require('./lib/log');
const {wallet_dir} = require('./lib/config');
const node = require('./bin')('node');
const fs = require('fs');

let mainWindow;

;(async function(){
  const isWin = /^win/.test(process.platform);
  let execPath = process.execPath;
  const port = await getPort();
  const token = Math.random().toString().slice(2);

  // startNodeServer();

  const proc = child_process.fork(grin, {
    execPath: isWin ? node : execPath,
    env: {
      port,
      token,
      start: '1',
      pid: process.pid,
    },
  });


  proc.on("error", err => {
    console.log(err);
  });

  proc.on('exit', (code, signal) => {
    console.log('exit', code, signal);
    log(`grin process exit with code ${code} and signal ${signal}`);
  });


  const icon = path.join(__dirname, 'assets/logo.png');

  function createWindow () {
    setDefaultApplicationMenu();
    mainWindow = new BrowserWindow({
      title: 'Grin Purse',
      width: 960,
      height: 600,

      minWidth: 960,
      minHeight: 600,
      backgroundColor: '#131E3B',
      webPreferences: {
        nodeIntegration: true,
        devTools: true,
      },
      icon: icon,
    });

    // and load the index.html of the app.
    if (isDev) {
      mainWindow.loadURL(`http://127.0.0.1:8000/?port=${port}&token=${token}`);
      mainWindow.webContents.openDevTools();
      // mainWindow.maximize();
    } else {
      mainWindow.loadURL(`file://${__dirname}/dist/index.html?port=${port}&token=${token}`);
      // mainWindow.webContents.openDevTools();
    }

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      mainWindow = null
    })
  }

  if (app.dock) {
    app.dock.setIcon(icon);
  }

  app.on('ready', createWindow)

  // app.on('before-quit', quit);
  // app.on('will-quit', quit);
  // app.on('quit', quit);

  // Quit when all windows are closed.
  app.on('window-all-closed', function () {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    log(`window-all-closed, going to kill grin process`);
    try {
      proc.kill();
    } catch(err) {

    }

    stopNodeServer(() => {
      log(`grin node process exit`);
      app.quit();
    });
  })

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
      createWindow()
    }
  });

  // In this file you can include the rest of your app's specific main process
  // code. You can also put them in separate files and require them here.

  // 在主进程中.
  ipcMain.on('asynchronous-message', (event, arg) => {
    console.log(arg) // prints "ping"
    event.sender.send('asynchronous-reply', 'pong')
  })

  ipcMain.on('synchronous-message', (event, arg) => {
    console.log(arg) // prints "ping"
    event.returnValue = 'pong'
  });

})();
