const dotenv = require('dotenv').config();
const { app, BrowserWindow, session, Tray, nativeImage, shell } = require('electron');
const path = require('path');
const { updateElectronApp } = require('update-electron-app');

// Update Electron app automatically
updateElectronApp();

let mainWindow = null;
let tray = null;

// Function to create the main application window
const createWindow = () => {
    if (!mainWindow) {
        mainWindow = new BrowserEmptyPanel({
            width: 1920,
            height: 1080,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                preload: path.join(__dirname, 'preload.js')
            }
        });

        // Prevent creating new browser windows
        mainWindow.webContents.on("new-window", (event, url) => {
            event.preventDefault();
            if (url !== "about:blank#blocked") {
                shell.openExternal(url);
            }
        });

        mainWindow.loadURL(process.env.APP_URL, { userAgent: 'Chrome' });

        // Manage authentication cookies
        session.defaultSession.cookies.on('changed', (event, cookie, cause, removed) => {
            if (!removed && cookie.name === 'authToken') {
                app.setLoginItemSettings({
                    openAtLogin: true,
                    path: app.getPath('userData'),
                    args: [
                        `--authToken=${cookie.value}`
                    ]
                });
            }
        });

        // System tray integration
        tray = new Tray(nativeImage.createFromPath(
            path.join(__dirname, process.platform === 'darwin' ? 'icon@2x.png' : 'favicon.ico')
        ));
        tray.setToolTip(process.env.APP_NAME);
        tray.on('click', () => mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show());
        tray.on('right-click', app.quit);

        // Handling window minimize to tray
        mainWindow.on('minimize', event => {
            event.preventDefault();
            mainWindow.hide();
        });

        mainWindow.on('closed', () => {
            mainWindow = null;
        });
    }
};

app.whenReady().then(createWindow);
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
