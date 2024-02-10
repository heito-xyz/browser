import { BrowserWindow } from 'electron';


export class WindowBrowser {
    private window: BrowserWindow;


    constructor() {
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

        win.loadFile('./src/public/index.html');

        return win;
    }
}