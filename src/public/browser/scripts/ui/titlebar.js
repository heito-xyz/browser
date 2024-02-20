import { $ipc } from '../ipc.js';

import { $tabs } from '../items/tabs.js';

class Titlebar {
    /**
     * @readonly
     * @type { HTMLElement }
    */
    el = document.querySelector('main .panel .titlebar');

    constructor() {
        this.initWindowButtons();
        this.initPanelButtons();
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

        const { webview } = $tabs.current.view;

        elBack.classList[webview.canGoBack() ? 'add' : 'remove']('active');
        elForward.classList[webview.canGoForward() ? 'add' : 'remove']('active');
        elReload.classList.add('active');
    }


    goViewBack() {
        const view = $tabs.current.view;

        if (!view) return false;

        view.webview.goBack();

        this.updateViewButtons();

        return true;
    }

    goViewForward() {
        const view = $tabs.current.view;

        if (!view) return false;

        view.webview.goForward();

        this.updateViewButtons();

        return true;
    }

    reloadView() {
        const view = $tabs.current.view;

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
            $ipc.emit('window:event', {
                type: 'close'
            });
        }

        elMaximize.onclick = () => {
            $ipc.emit('window:event', {
                type: 'maximize'
            });
        }

        elMinimize.onclick = () => {
            $ipc.emit('window:event', {
                type: 'minimize'
            });
        }


        $ipc.on('window:maximize:is', (event, is) => {
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
    initPanelButtons() {
        const btnTogglePanel = this.el.querySelector('.btn.menu');

        if (!btnTogglePanel) return;

        const panel = document.querySelector('main .panel');

        btnTogglePanel.addEventListener('click', () => {
            panel.classList.toggle('active')
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