const { ipcRenderer } = require('electron/renderer');


class IPC {
    renderer = ipcRenderer

    /**
     * @param { String } channel
     * @param { Array<any> } args
     * @return { Promise<[Electron.IpcRendererEvent]> }
    */
    async send(channel, ...args) {
        return new Promise(res => {
            ipcRenderer.send(channel, ...args);

            ipcRenderer.once(channel, (event, ...args) => {
                res([event, ...args]);
            });
        });
    }


    /**
     * @param { String } channel
     * @param { Array<any> } args
    */
    emit(channel, ...args) {
        return ipcRenderer.send(channel, ...args);
    }


    /**
     * @param { String } channel
     * @param { (event: Electron.IpcRendererEvent, ...args: Array<any>) } listener
    */
    on(channel, listener) {
        return ipcRenderer.on(channel, listener);
    }
}

export const $ipc = new IPC();