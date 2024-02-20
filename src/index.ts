import { app, BrowserWindow, autoUpdater, dialog } from 'electron';

// * Windows
import { WindowBrowser } from './windows/browser';
import { WindowAuth } from './windows/auth';

// * Utils
import { $accounts } from './utils/accounts';
import { $config } from './utils/config';


function createAuthWindow() {
    const authWindow = new WindowAuth();
}

function createBrowserWindow() {
    const browserWindow = new WindowBrowser();
}


function initWindows() {
    if (!$accounts.current) {
        createAuthWindow();
    }
    
    createBrowserWindow();

    $config
}


app.whenReady().then(() => {
    console.log('Init app');

    initWindows();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) initWindows();
    });

    app.on('web-contents-created', (event, contents) => {
        const content = contents.hostWebContents;

        contents.setWindowOpenHandler(details => {
            const account = $accounts.current;

            if (!account || !account.currentSpace) return { action: 'deny' };

            const tab = account.newTab(details.url, details.url, [
                'space',
                account.currentSpace?.id,
                '0',
                'inline'
            ]);
            
            content.send('tabs:new', tab);

            return {
                action: 'deny'
            }
        });
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});