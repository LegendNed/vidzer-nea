const { contextBridge, ipcRenderer } = require('electron');
const keytar = require('keytar');
const { userInfo } = require('os');

const validChannels = ['application', 'path'];
contextBridge.exposeInMainWorld('ipc', {
    send: (channel, data) => {
        if (validChannels.includes(channel)) {
            return ipcRenderer.sendSync(channel, data);
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

contextBridge.exposeInMainWorld('keytar', {
    set: (token) => {
        return keytar.setPassword('auth', userInfo().username, token);
    },
    get: () => {
        return keytar.getPassword('auth', userInfo().username);
    },
    delete: () => {
        return keytar.deletePassword('auth', userInfo().username);
    }
})