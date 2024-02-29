/**
 * @typedef ItemTab
 * 
 * @property { String } id
 * @property { String } name
 * @property { 'image' | 'icon' } icon.type
 * @property { String } icon.value
 * @property { String } url
 * @property { String } parent
 * @property { Number } updatedAt
 * @property { Number } createdAt
*/


// * Libs
import { $config } from '../config.js';
import { $ipc } from '../ipc.js';
import { $contextMenu } from '../../../global/scripts/contextMenu.js';

// * Items
import { $spaces } from './spaces.js';
import { $folders } from './folders.js';

// * UI
import { $sidebar } from '../ui/sidebar/index.js';
import { $titlebar } from '../ui/sidebar/titlebar.js';
import { $search } from '../ui/search.js';
import { $views } from '../ui/views.js';

// * Classes
import { Item, getDataParent } from '../classes/item.js';



export class Tab extends Item {
    /**
     * @param { ItemTab } tab
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

    close() {
        if (!this.view) return;

        this.view.remove();

        this.view = null;
    }


    setContextMenu() {
        const items = [
            {
                type: 'button',
                label: this.name
            },
        ];

        if (this.view !== null) {
            items.push({
                type: 'separator'
            }, {
                type: 'button',
                label: `Clear view`,
                click: () => {
                    $tabs.clearTab(this.id);
                }
            });
        }

        $contextMenu.set(items, {
            orientation: 'horizontal',
            el: this.node,
            fixed: true,
            position: ['top', 'right']
        });
    }


    /**
     * @private
    */
    initNode() {
        const tab = document.createElement('div');
    
        tab.id = `tab:${this.id}`;
        tab.draggable = true;
        tab.className = 'tab drag-item';
        tab.innerHTML = `
        <div class="item-icon">
            <img src="${this.image}" alt="Tab Image">
        </div>
        <div class="item-name">${this.name.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
        <ul>
            <i class="ib-more-horizontal"></i>
            <i class="ib-x"></i>
        </ul>
        `;
    

        // * Events
        tab.addEventListener('click', () => {
            if ($sidebar.el.classList.contains('spaces-settings')) return;

            $tabs.setCurrentTab(this.id);
        });

        tab.addEventListener('contextmenu', () => {
            this.setContextMenu();
        });


        // * Buttons
        const [btnMore, btnClose] = tab.querySelectorAll('ul i');

        btnMore.addEventListener('click', event => {
            event.stopPropagation();

            this.setContextMenu();
        });

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
     * @param { String } tabId
    */
    setCurrentTab(tabId) {
        const tab = this.list.get(tabId);

        if (!tab) return;

        if (tab.view === null) {
            tab.view = $views.create({
                mode: 'webview',
                tab
            });
        }
        
        $views.set(tab.view.id);
        // this.showView(tab.view);

        this.currentId = tab.id;

        const { classList } = tab.node;

        if (classList.contains('active')) return;

        const tabs = document.querySelectorAll('.space .tab.active');

        tabs.forEach(tab => {
            tab.classList.remove('active');
        });

        classList.add('active');

        $search.updateUrl(tab.url.hostname);

        if ($spaces.current.id !== tab.space.id) {
            $spaces.set(tab.space.id);
        }
    }

    /**
     * @param { Number } tabId
    */
    clearTab(tabId) {
        const tab = this.list.get(tabId);

        if (!tab) return false;

        tab.close();

        if (tab.id === this.currentId) {
            this.current.node.classList.remove('active');

            this.currentId = null;
        }

        return true;
    }


    /**
     * @param { ItemTab } tab
    */
    insert(tab) {
        const newTab = new Tab(tab);

        this.list.set(tab.id, newTab);

        newTab.insertToParent();

        return newTab;
    }

    /**
     * @param { Array<ItemTab> } tabs
    */
    insertAll(tabs) {
        const filterTabs = tabs.sort((a, b) => {
            const { index: aIndex } = getDataParent(a.parent);
            const { index: bIndex } = getDataParent(b.parent);

            return aIndex > bIndex ? 1 : -1;            
        });

        for (const tab of filterTabs) {
            this.insert(tab);
        }
    }
}

export const $tabs = new Tabs();