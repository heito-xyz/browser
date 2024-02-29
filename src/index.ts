import { app, BrowserWindow, autoUpdater, dialog, globalShortcut } from 'electron';

// * Windows
import { WindowBrowser } from './windows/browser';
import { WindowAuth } from './windows/auth';

// * Utils
import { $accounts } from './utils/accounts';
import { $config } from './utils/config';



let authWindow: WindowAuth | null = null,
    browserWindow: WindowBrowser | null = null;


function initWindows() {
    if (!$accounts.current) {
        authWindow = new WindowAuth();
    } else {
        browserWindow = new WindowBrowser();
    }

    $config
}


app.whenReady().then(async () => {
    console.log('Init app');

    await initWindows();

    if (process.argv[1] && browserWindow !== null && $accounts.current) {
        const url = process.argv[1];

        const tab = $accounts.current.newTab(url, url, [
            'space',
            $accounts.current.currentSpace?.id!,
            '0',
            'inline'
        ]);

        browserWindow.window.webContents.send('tabs:new', tab);
    }

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