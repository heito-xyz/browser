const { ipcRenderer } = require('electron/renderer');


const inputName = document.getElementById('name');
const button = document.querySelector('button');


let name = '';


inputName.addEventListener('input', event => {
    /** @type { HTMLInputElement } */
    const target = event.target;

    name = target.value;
});

button.addEventListener('click', () => {
    if (!name) return;

    ipcRenderer.send('auth:event', {
        type: 'login',
        name
    });
});