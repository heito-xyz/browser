import { $views } from './views.js';

const { ipcRenderer } = require('electron');

class Titlebar {
    /**
     * @readonly
     * @type { HTMLElement }
    */
    el = document.querySelector('main .panel .titlebar');

    constructor() {
        this.initWindowButtons();
        this.initViewButtons();
    }


    get windowButtons() {
        /** @type { Array<HTMLElement> } */
        const [elClose, elMaximize, elMinimize] = this.el.querySelectorAll('.window-buttons i');

        return { elClose, elMaximize, elMinimize };
    }

    get viewButtons() {
        /** @type { Array<HTMLElement> } */
        const [elBack, elForward, elReload] = this.el.querySelectorAll('.view-btn');

        return { elBack, elForward, elReload };
    }


    updateViewButtons() {
        const { elBack, elForward, elReload } = this.viewButtons;

        const { webview } = $views.getCurrentView();

        elBack.classList[webview.canGoBack() ? 'add' : 'remove']('active');
        elForward.classList[webview.canGoForward() ? 'add' : 'remove']('active');
        elReload.classList.add('active');
    }


    goViewBack() {
        const view = $views.getCurrentView();

        if (!view) return false;

        view.webview.goBack();

        this.updateViewButtons();

        return true;
    }

    goViewForward() {
        const view = $views.getCurrentView();

        if (!view) return false;

        view.webview.goForward();

        this.updateViewButtons();

        return true;
    }

    reloadView() {
        const view = $views.getCurrentView();

        if (!view) return false;

        view.webview.reload();
        
        return true;
    }


    /**
     * @private
    */
    initWindowButtons() {
        const { elClose, elMaximize, elMinimize } = this.windowButtons;

        elClose.onclick = () => {
            ipcRenderer.send('window:event', {
                type: 'close'
            });
        }

        elMaximize.onclick = () => {
            ipcRenderer.send('window:event', {
                type: 'maximize'
            });
        }

        elMinimize.onclick = () => {
            ipcRenderer.send('window:event', {
                type: 'minimize'
            });
        }


        ipcRenderer.on('window:maximize:is', (event, is) => {
            const main = document.querySelector('main');
            
            if (main) {
                main.style['border-radius'] = `${is ? 0 : 10}px`;
            }

            elMaximize.className = 'ib-' + (is ? 'minimize' : 'maximize');
        });
    }

    /**
     * @private
    */
    initViewButtons() {
        const { elBack, elForward, elReload } = this.viewButtons;

        elBack.onclick = () => {
            if (!elBack.classList.contains('active')) return;

            this.goViewBack();
        }

        elForward.onclick = () => {
            if (!elForward.classList.contains('active')) return;

            this.goViewForward();
        }

        elReload.onclick = () => {
            if (!elReload.classList.contains('active')) return;

            this.reloadView();
        }
    }
}

export const $titlebar = new Titlebar();