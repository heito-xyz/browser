import { $ipc } from '../ipc.js';

import { $tabs } from './tabs.js';
import { $folders } from './folders.js';

// * Libs
import { Sortable } from '../../../global/libs/sortable.js';

// * Classes
import { Item, getDataParent, getItem } from '../classes/item.js';


const elSpaces = document.querySelector('main .spaces');
const menuSpaces = document.querySelector('.b.menu .spaces');


class Space extends Item {
    list = [];

    /**
     * @param { String } icon
     * @param { String } name
     * @param { String } profileId
     * 
     * @param { Object } space
     * @param { String } space.id
     * @param { String } space.name
     * @param { String } space.icon
     * @param { String } space.profileId
     * @param { String } space.background
     * @param { Array.<{ type: 'folder' | 'tab', id: string }> } space.items
     * @param { Number } space.createdAt
    */
    constructor(space) {
        super(space, 'space', {
            flags: ['items'],
            selector: {
                position: '.list.main',
                index: '.list.main',
                inline: '.list.wait'
            }
        });
        console.log(this);
        
        this.icon = space.icon;
        this.profileId = space.profileId;
        this.background = space.background;
        this.items = space.items;

        /**
         * @readonly
         * @type { HTMLElement }
        */
        this.node = this.initNode();
    }


    /**
     * @param { String } icon
    */
    setIcon(icon) {
        this.icon = icon;
    }
    
    /**
     * @param { String } name
    */
    setProfile(name) {
        this.profileName = name;
    }


    /**
     * @param { String } url
    */
    async newTab(url) {
        if (!url) return;

        const [e, tab] = await $ipc.send('config:tabs:new', { name: url, url, parent: `space:${this.id}:0:inline` });

        $tabs.insert(tab);

        this.addItem('tab', tab.id, {
            mode: 'position',
            position: 'start'
        });

        $tabs.setCurrentTab(tab.id);

        return {
            tab
        }
    }


    /**
     * @private
    */
    initNodeButton() {
        const button = document.createElement('li');

        button.onclick = () => {
            if (button.classList.contains('acitve')) return;
            
            $spaces.set(this.id);
        }

        menuSpaces.appendChild(button);

        /**
         * @readonly
         * @type { HTMLElement }
        */
        this.nodeButton = button;
    }

    /**
     * @private
    */
    initNode() {
        const space = document.createElement('div');

        space.className = 'space';
        space.id = `space:${this.id}`;
        space.innerHTML = `
        <div class="header">
            <i class="${this.icon}"></i>
            <span class="item-name">${this.name}</span>
        </div>
        <div class="content">
            <div class="list main"></div>
            <div class="new-tab">
                <i class="ib-plus"></i>
                <span>New Tab</span>
            </div>
            <div class="list wait"></div>
        </div>
        `;

        const mainContent = space.querySelector('.list.main');
        const waitContent = space.querySelector('.list.wait');

        let dragElement = null;

        /** @type { Sortable } */
        this.mainSortable = this.initSortable(mainContent, {
            group: {
                name: `space:${this.id}`,
                put: true
            },
            draggable: '.tab, .folder',

            onStart: event => {
                dragElement = event.item;
            },

            onEnd: () => {
                dragElement = null
            }
        }, false);


        /** @type { Sortable } */
        this.waitSortable = this.initSortable(waitContent, {
            group: {
                name: `space:${this.id}`,
                put: () => {
                    return !dragElement.classList.contains('folder');
                }
            },
            draggable: '.tab',
            filter: '.folder',
        }, true);


        const newTab = space.querySelector('.new-tab');

        newTab.onclick = () => {
            this.newTab('https://ya.ru');
        }

        elSpaces.appendChild(space);

        this.initNodeButton();

        return space;
    }
}


class Spaces {
    /**
     * @private
     * @type { Number }
    */
    currentId = 0;

    /**
     * @readonly
     * @type { Map<Number, Space> }
    */
    list = new Map();


    /**
     * @return { Space }
    */
    get current() {
        return this.list.get(this.currentId);
    }


    /**
     * @param { String } id 
     */
    set(id) {
        if (!this.list.has(id)) return;
        
        const currentSpace = this.list.get(id);

        this.currentId = id;

        let index = 0;

        elSpaces.querySelectorAll('.space').forEach((space, idx) => {
            space.classList.remove('active');

            if (currentSpace.node === space) {
                index = idx;
            }
        });

        menuSpaces.querySelectorAll('li').forEach(btn => {
            btn.classList.remove('active');
        });

        currentSpace.node.classList.add('active');
        currentSpace.nodeButton.classList.add('active');

        elSpaces.style['transform'] = `translateX(calc(-100% * ${index}))`;
    }


    /**
     * @param { Object } space
     * @param { String } space.id
     * @param { String } space.name
     * @param { String } space.icon
     * @param { String } space.profileId
     * @param { Array.<{ type: 'folder' | 'tab', id: string }> } space.items
     * @param { Number } space.createdAt
     */
    insert(space) {
        const newSpace = new Space(space);

        this.list.set(space.id, newSpace);
    }

    /**
     * @param { Array.<{
     * id: string;
     * name: string;
     * icon: string;
     * profileId: string;
     * items: Array<{ type: 'folder' | 'tab', id: string }>;
     * createdAt: number;
     * }> } spaces
    */
    insertAll(spaces) {
        for (const space of spaces) {
            this.insert(space);
        }
    }
}


export const $spaces = new Spaces();