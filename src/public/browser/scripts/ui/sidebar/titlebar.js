// * Libs
import { $ipc } from '../../ipc.js';

// * UI
import { $sidebar } from './index.js';

// * Items
import { $tabs } from '../../items/tabs.js';

class Titlebar {
    /**
     * @readonly
     * @type { HTMLElement }
    */
    el = $sidebar.elTitlebar;

    constructor() {
        this.initWindowButtons();
        this.initSidebarButtons();
        this.initViewButtons();
    }


    get windowButtons() {
        console.log(this);
        /** @type { Array<HTMLElement> } */
        const [elClose, elMaximize, elMinimize] = this.el.querySelectorAll('i.btn-window');

        return { elClose, elMaximize, elMinimize };
    }

    get viewButtons() {
        /** @type { Array<HTMLElement> } */
        const [elBack, elForward, elReload] = this.el.querySelectorAll('i.btn-view');

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
    initSidebarButtons() {
        const btnToggleSidebar = this.el.querySelector('i.ib-show-sidebar');

        if (!btnToggleSidebar) return;

        btnToggleSidebar.addEventListener('click', () => {
            $sidebar.toggle();
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