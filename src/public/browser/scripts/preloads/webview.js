const { contextBridge, ipcRenderer } = require('electron');


const sendWebviewEvent = (name, event) => {
    ipcRenderer.sendToHost('webview:event', {
        name,
        event
    });
}

window.addEventListener('keydown', ({ altKey, ctrlKey, keyCode, key, shiftKey, metaKey }) => {
    sendWebviewEvent('keydown', { altKey, ctrlKey, keyCode, key, shiftKey, metaKey });
});

window.addEventListener('click', ({ clientX, clientY }) => {
    sendWebviewEvent('click', { clientX, clientY });
});