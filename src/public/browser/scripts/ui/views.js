// * Libs
import { $config } from '../config.js';
import { $contextMenu } from '../../../global/scripts/contextMenu.js';

// * UI
import { $sidebar } from './sidebar/index.js';
import { $titlebar } from './sidebar/titlebar.js';

// * Items
import { $spaces } from '../items/spaces.js';
import { $tabs, Tab } from '../items/tabs.js';


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


    initWebviewPreloadEvents(name, event) {
        switch(name) {
            case 'keydown': {
                if (event.ctrlKey && event.keyCode === 66) {
                    $sidebar.toggle();
                }
                break;
            }
            case 'click': {
                $contextMenu.close();
                break;
            }
        }
    }


    /**
     * @private
    */
    initViewEvents() {
        if (!this.webview) return;

        this.webview.addEventListener('ipc-message', event => {
            switch(event.channel) {
                case 'webview:event': {
                    const { name, event: eventData } = event.args[0];
                    this.initWebviewPreloadEvents(name, eventData);
                    break;
                }
            }
        });

        this.webview.addEventListener('dom-ready', event => {
            $titlebar.updateViewButtons();
        });

        this.webview.addEventListener('page-title-updated', event => {
            this.tab.setName(event.title);
        });

        this.webview.addEventListener('context-menu', event => {
            const { x, y, linkURL, srcURL, mediaType } = event.params;

            console.log(event.params);

            const buttons = [
                { type: 'separator' },
                {
                    type: 'button',
                    label: 'Dev tools',
                    click: () => {
                        this.webview.openDevTools();
                    }
                }
            ];

            if (linkURL) {
                buttons.unshift({
                    type: 'button',
                    label: 'Open to new tab',
                    click: () => {
                        $spaces.current.newTab(linkURL);
                    }
                });
            }

            if (mediaType === 'image' && srcURL) {
                buttons.unshift({
                    type: 'button',
                    label: 'Open image to new tab',
                    click: () => {
                        $spaces.current.newTab(srcURL);
                    }
                });
            }

            $contextMenu.set(buttons, {
                x, y,
                mode: 'center',
                position: ['bottom', 'right']
            });

            setTimeout(() => {
                this.webview.addEventListener('did-attach', (event) => {
                    console.log(event);
                    $contextMenu.close();
                }, { once: true });
            }, 10);
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
            webview.setAttribute('webpreferences', 'nativeWindowOpen=true');
            webview.setAttribute('preload', './scripts/preloads/webview.js');

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