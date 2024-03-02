import type { BrowserWindow } from 'electron';


export class TempateWindow {
    readonly name: string;
    readonly window!: BrowserWindow;

    constructor(name: string) {
        this.name = name;
    }
}

class Windows {
    private list = new Map<string, TempateWindow>();


    public has(key: string) {
        return this.list.has(key);
    }

    public get(key: string) {
        return this.list.get(key);
    }

    public create(key: string, window: TempateWindow) {
        this.list.set(key, window);

        return window;
    }

    public remove(key: string) {
        return this.list.delete(key);
    }
}

export const $windows = new Windows();