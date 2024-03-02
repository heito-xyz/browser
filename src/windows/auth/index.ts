import { BrowserWindow } from 'electron';
import path from 'path';

// * Windows
import { $windows, TempateWindow } from '..';

// * Utils
import { join } from '../../utils/path';
import { $accounts } from '../../libs/accounts';


export class WindowAuth extends TempateWindow {
    readonly window: BrowserWindow;


    constructor() {
        super('auth');

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

                    const browserWindow = $windows.get('browser');

                    if (!browserWindow) return;

                    browserWindow.window.show();
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

        win.loadFile(join('/public/auth/index.html'));

        return win;
    }
}