import { ipcMain } from 'electron';

type EventCallbackListener<Result = void> = (event: Electron.IpcMainEvent | Electron.IpcMainInvokeEvent, ...args: any[]) => Result;

export class EventListener {
    readonly name: string;

    constructor(name: string) {
        this.name = name;
    }


    private getChannelName(channel: string) {
        if (channel !== '') channel = ':' + channel;
        
        return `${this.name}${channel}`;
    }


    on(channel: string, listener: EventCallbackListener) {
        return ipcMain.on(this.getChannelName(channel), listener);
    }

    once(channel: string, listener: EventCallbackListener) {
        return ipcMain.once(this.getChannelName(channel), listener);
    }


    send(channel: string, listener: EventCallbackListener) {
        return ipcMain.handle(this.getChannelName(channel), listener);
    }


    group(name: string) {
        return new EventListener(this.getChannelName(name));
    }
}