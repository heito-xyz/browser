import { BrowserWindow, Menu, screen, MenuItem } from 'electron';
import path from 'path';

// * Utils
import { join } from '../../utils/path';

// * Windows
import { TempateWindow } from '..';





export class WindowBrowser extends TempateWindow {
    readonly window: BrowserWindow;


    constructor() {
        super('browser');

        this.window = this.init();

        this.initEvents();
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

        this.window.webContents.ipc.on('test', (e, ...args) => {
            console.log(e, args);
            
            e.reply('test', args);
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
            show: false,
            transparent: true,
            webPreferences: {
                webviewTag: true,
                sandbox: true,
                preload: path.join(__dirname, 'preload.js')
            }
        });
        
        win.setBounds({ width: 800 - 2, height: 600 -2 });
        
        win.loadFile(join('/public/browser/index.html'));

        return win;
    }
}