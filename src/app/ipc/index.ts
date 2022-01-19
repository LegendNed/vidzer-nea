import { BrowserWindow, ipcMain as ipc } from 'electron'

import Application from './events/application'
import Files from './events/files'

export default class {
    // Using term public automatically binds 'win' to the class
    constructor(public win: BrowserWindow) {
        // In order to the Browser Window within each IPC event,
        // we need to bind `this` from the class to the function
        ipc.on('application', Application.bind(this))
        ipc.on('path', Files.bind(this))
    }
}