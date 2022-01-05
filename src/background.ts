'use strict'

import { app, protocol, BrowserWindow, ipcMain as ipc, BrowserWindowConstructorOptions, Tray, Menu } from 'electron'
import { join as pathJoin } from 'path'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer'

import * as IPC from '@electron/remote/main'
IPC.initialize()

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])
class Application {
  options: BrowserWindowConstructorOptions;
  win: BrowserWindow;
  tray: Tray;
  isDevelopment: boolean;

  constructor(options: BrowserWindowConstructorOptions) {
    this.options = options

    this.isDevelopment = process.env.NODE_ENV !== 'production'
    this.init()
  }

  async createWindow() {
    this.win = new BrowserWindow(this.options)
    let win = this.win

    if (process.env.WEBPACK_DEV_SERVER_URL) await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string)
    else {
      createProtocol('app')
      win.loadURL('app://./index.html')
    }

    win.on('close', function (event) {
      event.preventDefault();
      win.hide();
      event.returnValue = false;
    });

    ipc.removeAllListeners()
    this.handleIPC()
  }

  generateTray() {
    this.tray = new Tray(pathJoin(__static, 'logo.png'))
    this.tray.setToolTip('Vidzer')

    this.tray.on('double-click', () => {
      if (this.win.isVisible()) return
      else this.win.show()
    })

    this.tray.setContextMenu(Menu.buildFromTemplate([
      { label: 'Quit' }
    ]))
  }

  init() {
    app.on('window-all-closed', () => {
      // On macOS it is common for applications and their menu bar
      // to stay active until the user quits explicitly with Cmd + Q
      console.log('quit')
      if (process.platform !== 'darwin') app.quit()
    })

    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length !== 0) return
      this.createWindow()
      this.generateTray()
    })

    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    app.on('ready', async () => {
      this.createWindow()
      this.generateTray()
    })

    if (this.isDevelopment) {
      if (process.platform === 'win32') {
        process.on('message', (data) => {
          if (data === 'graceful-exit') {
            app.quit()
          }
        })
      } else {
        process.on('SIGTERM', () => {
          app.quit()
        })
      }
    }
  }

  handleIPC() {
    ipc.on('application', (event, data) => {
      switch (data.action) {
        case 'minimize':
          this.win.minimize()
          break
        case 'close':
          this.win.close()
          break
      }
    })
  }
}

new Application({
  title: 'Vidzer',
  width: 720,
  height: 720,
  frame: false,
  resizable: false,
  fullscreenable: false,
  transparent: true,
  autoHideMenuBar: true,
  darkTheme: true,
  webPreferences: {
    nodeIntegration: false,
    contextIsolation: true,
    enableRemoteModule: false,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    // Preload IPC for rendering engine
    preload: pathJoin(__static, 'preload.js')
  }
} as BrowserWindowConstructorOptions)