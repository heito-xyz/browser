/**
 * @typedef ItemInItems
 * 
 * @property { 'folder' | 'tab' } type
 * @property { String } id
*/

/**
 * @typedef ItemSpace
 * 
 * @param { String } id
 * @param { String } name
 * @param { String } icon
 * @param { String } profileId
 * @param { String } background
 * @param { Array<ItemInItems> } items
 * @param { Number } createdAt
*/

// * Libs
import { $ipc } from '../ipc.js';
import { Sortable } from '../../../global/libs/sortable.js';

// * Items
import { $profiles } from './profiles.js';
import { $folders } from './folders.js';
import { $tabs } from './tabs.js';

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
     * @param { ItemSpace } space
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
        
        this.icon = space.icon;
        /** @private */
        this.profileId = space.profileId;
        this.background = space.background;
        this.items = space.items;

        /**
         * @readonly
         * @type { HTMLElement }
        */
        this.node = this.initNode();
    }


    get profile() {
        return $profiles.list.get(this.profileId);
    }


    /**
     * @param { String } icon
    */
    setIcon(icon) {
        this.icon = icon;
    }
    
    /**
     * @param { String } id
    */
    setProfile(id) {
        this.profileId = id;
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
            <i class="ib-${this.icon}"></i>
            <div class="item-name" contenteditable="true">${this.name}</div>
            <div class="profile">${this.profile.name}</div>
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


        // ? Header
        const spaceName = space.querySelector('.header .item-name');

        let timerName;

        spaceName.addEventListener('input', () => {
            clearTimeout(timerName);

            timerName = setTimeout(() => {
                this.setName(spaceName.textContent);
            }, 700);
        });


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


    constructor() {
        this.init();
    }


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
     * @param { ItemSpace } space
     */
    insert(space) {
        const newSpace = new Space(space);

        this.list.set(space.id, newSpace);

        return newSpace;
    }

    /**
     * @param { Array<ItemSpace> } spaces
    */
    insertAll(spaces) {
        for (const space of spaces) {
            this.insert(space);
        }
    }


    /**
     * @private
    */
    init() {
        elSpaces.addEventListener('wheel', event => {
            if (!event.ctrlKey) return;
        
            const list = [...this.list.keys()];
            
            const currentIndex = list.indexOf(this.current.id);
        
            const isDown = event.deltaY >= 0;
        
            if (currentIndex === 0 && !isDown) return;
        
            this.set(list[isDown ? currentIndex + 1 : currentIndex - 1]);
        })
    }
}


export const $spaces = new Spaces();