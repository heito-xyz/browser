import { $spaces } from './spaces.js';
import { $titlebar } from '../ui/titlebar.js';
import { $search } from '../ui/search.js';
import { $folders } from './folders.js';
import { $ipc } from '../ipc.js';
import { $config } from '../config.js';
import { Item, getDataParent } from '../classes/item.js';


class View {
    /**
     * @param { Tab } tab
    */
    constructor(tab) {
        /**
         * @readonly
         * @type { Tab }
        */
        this.tab = tab;

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

        this.webview.stop();
    
        this.node.remove();
    }


    /**
     * @private
    */
    initViewEvents() {
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
            // this.tab.setImage(event.favicons[0]);
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

        view.id = String(this.tab.id);
        view.className = 'view';

        /** @type { Electron.WebviewTag } */
        const webview = document.createElement('webview');

        webview.src = this.tab.url;
        webview.setAttribute('allowpopups', 'true');
        webview.setAttribute('autosize', 'true');
        webview.setAttribute('partition', `persist:profile:${this.tab.space.profileId}`);

        webview.addEventListener('DOMNodeInserted', () => {
            setTimeout(() => {
                this.initViewEvents();
            }, 10);
        });

        view.appendChild(webview);

        return view;
    }
}

export class Tab extends Item {
    /**
     * @param { Object } tab
     * @param { String } tab.id
     * @param { String } tab.name
     * @param { String } tab.url
     * @param { String } tab.parent
     * @param { Number } tab.createdAt
    */
    constructor(tab) {
        super(tab, 'tab', {
            flags: ['parent']
        });

        /**
         * @readonly
         * @type { URL }
        */
        this.url = new URL(tab.url);
        this.name = tab.name || this.url.hostname;

        this._image = `https://www.google.com/s2/favicons?domain=${this.url.origin}`;
    
        /**
         * @readonly
         * @type { View | null }
        */
        this.view = null; // new View(this);
        
        /**
         * @readonly
         * @type { HTMLElement }
        */
        this.node = this.initNode();
    }


    get image() {
        return this._image;
    }

    /**
     * @param { String } image
    */
    setImage(src) {
        const element = this.node.querySelector('img');

        if (!element) return false;

        const img = new Image();

        img.src = src;

        img.onload = () => {
            element.src = src;
            this._image = src;
        }

        return true;
    }


    remove() {
        this.node.remove();
        
        $config.removeItem('tab', this.id, 'archive');

        if (!this.view) return;

        this.view.remove();
    }


    /**
     * @private
    */
    initNode() {
        const tab = document.createElement('div');
    
        tab.id = `tab:${this.id}`;
        tab.draggable = true;
        tab.className = 'tab drag-item';
        tab.innerHTML = `<img src="${this.image}" alt="Tab Image"><span class="item-name">${this.name.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>`;
        tab.innerHTML += `<ul><i class="ib-options"></i><i class="ib-close"></i></ul>`;

        const [btnOptions, btnClose] = tab.querySelectorAll('ul i');
    
        tab.onclick = () => {
            $tabs.setCurrentTab(this.id);
        }


        tab.addEventListener('dragstart', event => {
            event.dataTransfer.setData('tab', this.id);
        });


        btnOptions.onclick = () => {}

        btnClose.addEventListener('click', event => {
            event.stopPropagation();

            this.remove();
        }, { once: true });

        return tab;
    }
}

class Tabs {
    /**
     * @readonly
     * @type { Map<Number, Tab> }
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
     * @private
     * @param { View } view
    */
    showView(view) {
        const views = document.querySelector('main .views');

        /**
         * @type { Array<HTMLElement> }
        */
        const listViews = views.querySelectorAll('.view');

        for (const { id, style } of listViews) {
            const is = view.tab.id == id;

            style.display = is ? 'block' : 'none';
        }

        if (view.node.isConnected) return;

        views.appendChild(view.node);
    }

    /**
     * @param { Number } tabId
    */
    setCurrentTab(tabId) {
        const tab = this.list.get(tabId);

        if (!tab) return;

        if (tab.view === null) {
            tab.view = new View(tab);
        }
        
        this.showView(tab.view);

        this.currentId = tab.id;

        const { classList } = tab.node;

        if (classList.contains('active')) return;

        const tabs = document.querySelectorAll('.space .tab.active');

        tabs.forEach(tab => {
            tab.classList.remove('active');
        });

        classList.add('active');

        $search.updateUrl(tab.url.hostname);
    }


    /**
     * @param { Object } tab
     * @param { String } tab.id
     * @param { String } tab.name 
     * @param { String } tab.url
     * @param { String } tab.parent
     * @param { Number } tab.createdAt
    */
    insert(tab) {
        const newTab = new Tab(tab);

        this.list.set(tab.id, newTab);

        newTab.insertToParent();

        return newTab;
    }

    /**
     * @param { Array.<{
     * id: string;
     * name: string;
     * url: string;
     * parent: string;
     * updatedAt: number;
     * createdAt: number;
     * }> } tabs
    */
    insertAll(tabs) {
        const filterTabs = tabs.sort((a, b) => {
            const { index: aIndex } = getDataParent(a.parent);
            const { index: bIndex } = getDataParent(b.parent);

            return aIndex > bIndex ? 1 : -1;            
        });

        for (const tab of filterTabs) {
            let a = this.insert(tab);
            
            console.log(a.name, a.parent.index);
        }
    }
}

export const $tabs = new Tabs();