import { app, BrowserWindow, Menu, screen } from 'electron';
import * as path from 'path';
import * as url from 'url';

let mainWindow: BrowserWindow | null;

function createWindow() {
    const displays = screen.getAllDisplays();
    const externalDisplay = displays.find((display) => (display.bounds.x !== 0 || display.bounds.y !== 0));

    let mainWindow;
    if(externalDisplay) {
        mainWindow = new BrowserWindow({
            width: 800,
            height: 600,
            x: externalDisplay.bounds.x + 50,
            y: externalDisplay.bounds.y + 50
        });
    }
    else {
        mainWindow = new BrowserWindow({
            width: 800,
            height: 600,
            x: 50,
            y: 50
        });
    }

    mainWindow.loadURL(
        process.env.ELECTRON_START_URL || url.format({
            pathname: path.join(__dirname, '../index.html'),
            protocol: 'file:',
            slashes: true
        })
    );

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if(process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if(mainWindow === null) {
        createWindow();
    }
});