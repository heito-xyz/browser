import { BrowserWindow, Menu, screen } from 'electron';
import path from 'path';


export class WindowBrowser {
    private window: BrowserWindow;


    constructor() {
        this.window = this.init();

        this.initEvents();
    }


    private initWorker() {
        // const worker = new SharedWorkerInfo(path.join(__dirname, '../workers/config.js'), {
        //     name: 'config',
        // });
        // worker.on('message', event => {
        //     console.log('message', event);
        // });

        // worker.on('error', event => {
        //     console.log('error', event);
        // });

        // worker.on('messageerror', event => {
        //     console.log('messageerror', event);
        // });

        // worker.on('exit', event => {
        //     console.log('exit', event);
        // });

        // worker.on('online', () => {
        //     console.log('online');
        // });
    }


    private initEvents() {
        this.window.webContents.ipc.on('window:event', (e, { type }) => {
            switch(type) {
                case 'close':
                    this.window.close();
                    break;
                case 'maximize':
                    this.window[this.window.isMaximized() ? 'unmaximize' : 'maximize']();
                    break;
                case 'minimize':
                    this.window.minimize();
                    break;
            }
        });

        this.window.webContents.ipc.on('window:contextmenu', event => {
            // const menu = Menu.buildFromTemplate([
            //     {
            //         label: 'Menu Item 1',
            //         click: () => {

            //         }
            //     },
            //     { type: 'separator' },
            //     {
            //         label: 'Menu Item 2',
            //         type: 'checkbox',
            //         checked: true
            //     }
            // ]);

            // menu.popup({ window: this.window });
        
            // const mousePos = screen.getCursorScreenPoint();

            // $contextWindow.set(mousePos.x, mousePos.y);
        });

        this.window.on('maximize', () => {
            this.window.webContents.send('window:maximize:is', true);
        });

        this.window.on('unmaximize', () => {
            this.window.webContents.send('window:maximize:is', false);
        });
    }


    private init() {
        const win = new BrowserWindow({
            width: 800,
            height: 600,
            minWidth: 360,
            minHeight: 240,
            frame: false,
            hasShadow: false,
            transparent: true,
            webPreferences: {
                webviewTag: true,
                nodeIntegration: true,
                contextIsolation: false
            }
        });

        win.loadFile('./src/public/browser/index.html');
        
        win.webContents
        .executeJavaScript('({...localStorage});', true)
        .then(localStorage => {
            console.log(localStorage);
        });

        this.initWorker();

        return win;
    }
}