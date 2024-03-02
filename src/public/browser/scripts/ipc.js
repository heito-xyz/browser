// const { ipcRenderer } = require('electron/renderer');


class IPC {
    renderer = browserAPI.ipc;

    /**
     * @param { String } channel
     * @param { Array<any> } args
    */
    emit(channel, ...args) {
        return this.renderer.send(channel, ...args);
    }

    /**
     * @param { String } channel
     * @param { Array<any> } args
    */
    async invoke(channel, ...args) {
        return this.renderer.invoke(channel, ...args);
    }


    /**
     * @param { String } channel
     * @param { (event: Electron.IpcRendererEvent, ...args: Array<any>) } listener
    */
    on(channel, listener) {
        return this.renderer.on(channel, listener);
    }

    /**
     * @param { String } channel
     * @param { (event: Electron.IpcRendererEvent, ...args: Array<any>) } listener
    */
    once(channel, listener) {
        return this.renderer.once(channel, listener);
    }
}

export const $ipc = new IPC();