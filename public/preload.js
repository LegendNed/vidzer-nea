const { contextBridge, ipcRenderer } = require('electron');

const validChannels = ['application'];
contextBridge.exposeInMainWorld('ipc', {
    send: (channel, data) => {
        if (validChannels.includes(channel)) {
            ipcRenderer.send(channel, data);
        }
    },
    on: (channel, func) => {
        if (validChannels.includes(channel)) {
            // Strip event as it includes `sender` and is a security risk
            ipcRenderer.on(channel, (event, ...args) => func(...args));
        }
    }
});

contextBridge.exposeInMainWorld('domain',
    process.env.NODE_ENV !== 'production'
        ? 'http://localhost:8000'
        : 'someDomain.com'
);