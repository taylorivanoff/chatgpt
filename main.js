const dotenv = require('dotenv');
dotenv.config(); // Load environment variables from .env file

const {app, BrowserWindow, session, Tray, nativeImage } = require('electron/main')
const path = require('path');

let tray;

const {updateElectronApp} = require('update-electron-app');
updateElectronApp();

const createWindow = () => {
    const win = new BrowserWindow({
        width: 1920,
        height: 1080,
        webPreferences: {
            nodeIntegration: true,
        }
    })

    // Make links set to open a new tab and window.open() open in the default browser instead of a new application window
    win.webContents.on("new-window", function (event, url) {
        event.preventDefault();
        if (url !== "about:blank#blocked") electron.shell.openExternal(url);
    });

    win.loadURL(process.env.APP_URL, {userAgent: 'Chrome'}); // Use environment variable

    // Listen for authentication-related cookies
    session.defaultSession.cookies.on('changed', (event, cookie, cause, removed) => {
        if (!removed) { // Use environment variable
            // Store the authentication
            app.setLoginItemSettings({
                openAtLogin: true,
                path: app.getPath('userData'),
                args: [
                    '--authToken=' + cookie.value
                ]
            });
        }
    });

    // Create a tray icon based on the current platform
    if (process.platform === 'darwin') {
        tray = new Tray(nativeImage.createFromPath(path.join(__dirname, 'icon@2x.png')));
    } else if (process.platform === 'win32') {
        // https://www.xiconeditor.com/
        tray = new Tray(nativeImage.createFromPath(path.join(__dirname, 'favicon.ico')));
    }

    tray.setToolTip(process.env.APP_NAME); // Set tooltip for the tray icon

    // Minimize to tray when window is minimized
    win.on('minimize', function (event) {
        event.preventDefault();
        win.hide();
    });

    // Restore window when tray icon is clicked
    tray.on('click', function () {
        mainWindow.show();
    });

    // Quit application when tray icon is right-clicked
    tray.on('right-click', () => {
        app.quit();
    });
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})




