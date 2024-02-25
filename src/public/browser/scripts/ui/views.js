// * Libs
import { $config } from '../config.js';

// * UI
import { $titlebar } from './titlebar.js';

// * Items
import { Tab } from '../items/tabs.js';


class View {
    /**
     * @readonly
     * @type { Number }
    */
    id = $views.list.size;

    /**
     * @param { 'webview' | 'page' } type 
     * @param { Tab | Page } component
    */
    constructor(type, component) {
        /**
         * @readonly
         * @type { 'webview' | 'page' }
        */
        this.type = type;

        if (this.type === 'webview') {
            /**
             * @readonly
             * @type { Tab }
            */
            this.tab = component;
        } else if (this.type === 'page') {
            /**
             * @readonly
             * @type { Page }
            */
            this.page = component;
        }

        console.log(type, component);


        /**
         * @readonly
         * @type { HTMLElement }
        */
        this.node = this.initNode();
    }


    /**
     * @return { Electron.WebviewTag }
    */
    get webview() {
        return this.node.querySelector('webview');
    }


    remove() {
        if (!this.node.isConnected) return;

        if (this.type === 'webview' && this.webview) {
            this.webview.stop();
            this.webview.remove();
        }
    
        this.node.remove();
    }


    /**
     * @private
    */
    initViewEvents() {
        if (!this.webview) return;

        this.webview.addEventListener('dom-ready', event => {
            $titlebar.updateViewButtons();
            // webview.insertCSS(`
            // ::-webkit-scrollbar {
            //     width: 8px;
            // }
            // ::-webkit-scrollbar-thumb {
            //     border-radius: 10px;
            // }
            // `);
        });

        this.webview.addEventListener('page-title-updated', event => {
            this.tab.setName(event.title);
        });

        this.webview.addEventListener('page-favicon-updated', event => {
            if (event.favicons.length < 1) return;

            this.tab.setImage(event.favicons[0]);
        });

        this.webview.addEventListener('did-navigate-in-page', event => {
            $config.updateItem('tab', this.tab.id, {
                url: event.url
            });
        });

        // this.webview.addEventListener('did-start-loading', event => {
        //     console.log('start loading', event);
        // });

        // this.webview.addEventListener('did-stop-loading', event => {
        //     console.log('stop loading', event);
        // });
    }


    /**
     * @private
    */
    initNode() {
        const view = document.createElement('div');

        view.className = 'view';

        if (this.type === 'webview' && this.tab) {
            view.id = String(this.tab.id);

            /** @type { Electron.WebviewTag } */
            const webview = document.createElement('webview');

            webview.src = this.tab.url;
            webview.setAttribute('allowpopups', 'true');
            webview.setAttribute('autosize', 'true');
            webview.setAttribute('partition', `persist:profile:${this.tab.space.profile.id}`);
            webview.setAttribute('webpreferences', 'nativeWindowOpen=true')

            webview.addEventListener('DOMNodeInserted', () => {
                setTimeout(() => {
                    this.initViewEvents();
                }, 10);
            });

            view.appendChild(webview);
        } else if (this.type === 'page' && this.page) {
            console.log(this.type, this.page);
            view.appendChild(this.page);
        }

        return view;
    }
}

class Views {
    /**
     * @private
     * @type { HTMLElement }
    */
    el = document.querySelector('main > .views');


    /**
     * @readonly
     * @type { Map<string, View> }
    */
    list = new Map();


    /**
     * @private
     * @type { Number | null }
    */
    currentId = null;


    get current() {
        return this.list.get(this.currentId);
    }


    /**
     * @param { Number } id 
    */
    set(id) {
        if (!this.list.has(id)) return false;

        if (this.currentId === id) return true;

        this.list.forEach(view => {
            view.node.style.display = view.id === id ? 'block' : 'none';
        });

        this.currentId = id;

        return true;
    }


    /**
     * @param { Object } options
     * @param { 'webview' | 'page' } options.mode
     * @param { Tab } options.tab
     * @param { Page } options.page
     * @param { Boolean } [show=true]
    */
    create(options = {}, show = true) {
        const {
            mode = 'webview',
            tab,
            page
        } = options;
        
        if ((mode === 'webview' && !tab) || (mode === 'page' && !page)) return false;

        const view = new View(mode, mode === 'page' ? page : tab);

        this.list.set(view.id, view);

        this.el.appendChild(view.node);

        this.set(view.id);

        return view;
    }
}

export const $views = new Views();