const { app, BrowserWindow, session } = require('electron');

let mainWindow;

let appUrl = 'https://chatgpt.com/';
let rootAppUrl = '.chatgpt.com';

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 1920,
        height: 1080,
        webPreferences: {
            nodeIntegration: true,
        }
    });

    // Hide default top menu
    mainWindow.setMenu(null);

    // Make links set to open a new tab and window.open() open in the default browser instead of a new application window
    mainWindow.webContents.on("new-window", function (event, url) {
        event.preventDefault();
        if (url !== "about:blank#blocked") electron.shell.openExternal(url);
    });

    mainWindow.loadURL(appUrl, {userAgent: 'Chrome'});

    // Listen for authentication-related cookies
    session.defaultSession.cookies.on('changed', (event, cookie, cause, removed) => {
        if (!removed && cookie.domain.includes(rootAppUrl)) {
            // Store the authentication-related cookie
            app.setLoginItemSettings({
                openAtLogin: true,
                path: app.getPath('userData'),
                args: [
                    '--authToken=' + cookie.value
                ]
            });
        }
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
});