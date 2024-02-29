import { BrowserWindow } from 'electron';
import path from 'path';

// * Utils
import { $accounts } from '../utils/accounts';
import { $config } from '../utils/config';


export class WindowAuth {
    private window: BrowserWindow;


    constructor() {
        this.window = this.init();

        this.initEvents();
    }


    private initEvents() {
        this.window.webContents.ipc.on('auth:event', (e, { type, name }) => {
            switch(type) {
                case 'login':
                    $accounts.create(name);
                    $accounts.set(name);

                    this.window.close();

                    $accounts.saveToFile();
                    break;
            }
        });
    }


    private init() {
        const win = new BrowserWindow({
            width: 360,
            height: 540,
            resizable: false,
            frame: false,
            hasShadow: false,
            transparent: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        });

        const isDev = process.env.NODE_ENV === 'dev';

        win.loadFile(path.join(__dirname, `../${isDev ? '../src/' : ''}public/browser/index.html`));

        return win;
    }
}