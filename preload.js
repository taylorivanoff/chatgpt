const { contextBridge, ipcRenderer } = require('electron');

// Expose a few APIs to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    setToken: (token) => {
        localStorage.setItem('authToken', token);
    },
    getToken: () => {
        return localStorage.getItem('authToken');
    }
});
