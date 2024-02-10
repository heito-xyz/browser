import { app, BrowserWindow, autoUpdater, dialog } from 'electron';

// * Windows
import { WindowBrowser } from './windows/browser';


const server = 'https://hazel-mu-three.vercel.app';
const url = `${server}/update/${process.platform}/${app.getVersion()}`;


autoUpdater.setFeedURL({ url });

setInterval(() => {
    autoUpdater.checkForUpdates()

    console.log('check update');
    
}, 60000)

const event = (name: string) => {
    autoUpdater.on(name as any, (...args: any) => {
        console.log(name, args);
        
    });
}

event('checking-for-update');
event('update-available');
event('update-not-available');
event('before-quit-for-update');


autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
    console.log(event, releaseNotes, releaseName);
    
    
    const dialogOpts = {
      type: 'info',
      buttons: ['Restart', 'Later'],
      title: 'Application Update',
      message: process.platform === 'win32' ? releaseNotes : releaseName,
      detail:
        'A new version has been downloaded. Restart the application to apply the updates.'
    }
  
    dialog.showMessageBox(new BrowserWindow(), dialogOpts as any).then((returnValue) => {
        if (returnValue.response === 0) autoUpdater.quitAndInstall()
    })
  })

autoUpdater.on('error', (message) => {
    console.error('There was a problem updating the application')
    console.error(message)
  })


function initContextMenu() {
    menu = new BrowserWindow({
        frame: false,
        width: 196,
        height: 128,
        resizable: false,
        hasShadow: false,
        transparent: true,
        show: false,
        type: 'toolbar',
        alwaysOnTop: true
    });

    // menu.loadFile('./src/public/header.html');

    menu.on('blur', () => {
        menu.hide();
    });

    menu.on('show', () => {
        menu.setSize(196, 128);
    })

    return menu;
}


let menu: BrowserWindow;


function createBrowserWindow() {
    const browserWindow = new WindowBrowser();
}

app.whenReady().then(() => {
    createBrowserWindow();

    initContextMenu();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createBrowserWindow();
    });

    app.on('web-contents-created', (event, contents) => {
        const content = contents.hostWebContents;

        contents.setWindowOpenHandler(details => {
            content.send('tabs:new', details);
            
            return {
                action: 'deny'
            }
        });
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});