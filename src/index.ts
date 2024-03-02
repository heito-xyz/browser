import { app, BrowserWindow, autoUpdater, dialog, globalShortcut, protocol, net } from 'electron';
import path from 'path';
import { pathToFileURL } from 'url';



// * Windows
import { $windows } from './windows';
import { WindowBrowser } from './windows/browser';
import { WindowAuth } from './windows/auth';

// * Utils
import { $accounts } from './libs/accounts';

// * Events
import './events/config';
import './events/accounts';



class BrowserApp {
    private authWindow: WindowAuth | null = null;
    private browserWindow: WindowBrowser | null = null;

    constructor() {
        const gotTheLock = app.requestSingleInstanceLock();

        if (gotTheLock) this.start();
        else app.quit();
    }


    private createWindows() {
        this.authWindow = new WindowAuth();
        this.browserWindow = new WindowBrowser();

        if ($accounts.current) {
            this.authWindow.window.close();
            this.browserWindow.window.show();
        }

    
        $windows.create('auth', this.authWindow);
        $windows.create('browser', this.browserWindow);
    }


    private initProtocols() {
        protocol.handle('test-app', req => {
            const { host, pathname } = new URL(req.url);

            // console.log(req, host, pathname, __dirname);
            
            return new Response('<h1>?</h1>', {
                headers: {
                    'Content-Type': 'text/html'
                }
            });
        });
    }


    start() {
        app.setAsDefaultProtocolClient('test-app');

        protocol.registerSchemesAsPrivileged([
            {
                scheme: 'test-app',
                privileges: {
                    standard: true,
                    secure: true,
                    supportFetchAPI: true
                }
            }
        ]);

        app.on('second-instance', (event, commandLine, workingDirectory) => {
            console.log('second', event, commandLine, workingDirectory);

            const win = this.browserWindow?.window;
            
            if (win) {
                if (win.isMaximized()) win.restore();
        
                win.focus();
            }
        });

        app.once('open-url', (event, url) => {
            console.log(1, event, url);
        });

        app.whenReady().then(async () => {
            console.log('Start app');

            this.initProtocols();

            await this.createWindows();

            if (process.argv[1] && this.browserWindow !== null && $accounts.current) {
                const url = process.argv[1];

                console.log(url);
                

                // const tab = $accounts.current.newTab(url, url, [
                //     'space',
                //     $accounts.current.currentSpace?.id!,
                //     '0',
                //     'inline'
                // ]);

                // this.browserWindow.window.webContents.send('tabs:new', tab);
            }

            app.on('activate', () => {
                if (BrowserWindow.getAllWindows().length === 0) this.createWindows();
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
    }
}


new BrowserApp();


app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});