/**
 * @typedef ItemInItems
 * 
 * @property { 'folder' | 'tab' } type
 * @property { String } id
*/

/**
 * @typedef ItemSpace
 * 
 * @property { String } id
 * @property { String } name
 * @property { 'image' | 'icon' } icon.type
 * @property { String } icon.value
 * @property { String } profileId
 * @property { String } background
 * @property { Array<ItemInItems> } items
 * @property { Number } createdAt
*/

// * Libs
import { $ipc } from '../ipc.js';
import { Sortable } from '../../../global/libs/sortable.js';
import { $contextMenu } from '../../../global/scripts/contextMenu.js';

// * Items
import { $profiles } from './profiles.js';
import { $folders } from './folders.js';
import { $tabs } from './tabs.js';

// * UI
import { $sidebar } from '../ui/sidebar/index.js';
import { $search } from '../ui/search.js';

// * Classes
import { Item, getDataParent, getItem } from '../classes/item.js';

// * Components
import { selectIconComponent } from '../components/selectIcon.js';
import { $config } from '../config.js';


const menuSpaces = $sidebar.elNavigate.querySelector('.spaces ul');



class Space extends Item {
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

        this.setIcon(this.icon.type, this.icon.value);
    }


    get profile() {
        return $profiles.list.get(this.profileId);
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

        const tab = await $ipc.invoke('configs:tabs:new', { name: url, url, parent: `space:${this.id}:0:inline` });

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


    // * Context Menus
    /** @private */
    setSpaceContextMenu() {
        const options = {
            el: this.node.querySelector('.header'),
            fixed: true,
            position: ['bottom', 'right']
        };

        $contextMenu.set([
            {
                type: 'button',
                label: 'Change icon',
                click: () => {
                    const icon = this.node.querySelector('.item-icon');

                    setTimeout(() => {
                        $contextMenu.set([
                            {
                                type: 'component',
                                component: selectIconComponent(item => {
                                    this.setIcon(item.type, item.value);

                                    $contextMenu.close();
                                })
                            }
                        ], {
                            el: icon,
                            fixed: true,
                            position: ['bottom', 'left']
                        });
                    }, 10);
                }
            },
            {
                type: 'button',
                label: 'Rename',
                click: () => {
                    this.node.querySelector('.item-name').focus();
                }
            },
            {
                type: 'button',
                label: 'Change profile',
                click: () => {
                    setTimeout(() => {
                        const buttons = [];

                        $profiles.list.forEach(profile => {
                            buttons.push({
                                type: 'button',
                                label: profile.name + (this.profileId === profile.id ? ' (Current)' : ''),
                                click: () => {
                                    $config.updateItem('space', this.id, {
                                        profileId: profile.id
                                    });

                                    this.profileId = profile.id;

                                    $contextMenu.close();
                                }
                            });
                        });

                        $contextMenu.set(buttons, options);
                    }, 10);
                }
            }
        ], options);
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
            <div class="item-icon"></div>
            <div class="item-name" contenteditable="true">${this.name}</div>
            <i class="ib-edit-2"></i>
        </div>
        <div class="content">
            <div class="list main"></div>
            <div class="clear">
                <i class="ib-slash"></i>
                <span>Clear</span>
            </div>
            <div class="new-tab">
                <i class="ib-plus"></i>
                <span>New Tab</span>
            </div>
            <div class="list wait"></div>
        </div>
        <div class="options">
            <i class="ib-move"></i>

            <i class="ib-more-horizontal"></i>
        </div>
        `;


        // <i class="ib-${this.icon}" style="display: ${this.icon ?};"></i>

        // ? Header
        const header = space.querySelector('.header');

        header.addEventListener('contextmenu', () => {
            this.setSpaceContextMenu();
        });

        const [spaceIcon, spaceName, editButton] = header.querySelectorAll('.item-icon, .item-name, i:nth-child(3)');

        let timerName;

        spaceName.addEventListener('input', () => {
            clearTimeout(timerName);

            timerName = setTimeout(() => {
                this.setName(spaceName.textContent);
            }, 700);
        });

        editButton.addEventListener('click', () => {
            this.setSpaceContextMenu();
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

                    return !dragElement?.classList?.contains('folder');
                }
            },
            draggable: '.tab',
            filter: '.folder',
        }, true);


        const clearBtn = space.querySelector('.clear');

        clearBtn.addEventListener('click', () => {
            waitContent.querySelectorAll('.tab').forEach(tab => {
                const [_, id] = tab.id.split(':');

                if (!$tabs.list.has(id)) return;
            
                $tabs.list.get(id).remove();
            });
        });


        const newTab = space.querySelector('.new-tab');

        newTab.onclick = () => {
            $search.show();
        }

        $sidebar.elSpaces.appendChild(space);

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
        if (this.currentId === id || !this.list.has(id)) return;
        
        const currentSpace = this.list.get(id);

        this.currentId = id;

        let index = 0;

        $sidebar.elSpaces.querySelectorAll('.space').forEach((space, idx) => {
            space.classList.remove('active');

            if (currentSpace.node === space) {
                index = idx;
            }
        });

        menuSpaces.querySelector('li.active')?.classList.remove('active');

        currentSpace.node.classList.add('active');
        currentSpace.nodeButton.classList.add('active');

        $sidebar.elSpaces.style['transform'] = `translateX(calc(-100% * ${index}))`;
        
        menuSpaces.scrollTo({
            left: (16 * index) - (menuSpaces.clientWidth / 2 - 8),
            behavior: 'smooth'
        });

        setTimeout(() => {
            menuSpaces.parentElement.style.setProperty('--left', (menuSpaces.scrollLeft === 0 ? 0 : 15) + '%');
            menuSpaces.parentElement.style.setProperty('--right', (menuSpaces.scrollLeft >= (menuSpaces.scrollWidth - menuSpaces.clientWidth - 16) ? 100 : 85) + '%');
        }, 100);
    
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
        $sidebar.elSpaces.addEventListener('wheel', event => {
            if (!event.ctrlKey) return;
        
            const list = [...this.list.keys()];
            
            const currentIndex = list.indexOf(this.current.id);
        
            const isDown = event.deltaY >= 0;
        
            if (currentIndex === 0 && !isDown) return;
        
            this.set(list[isDown ? currentIndex + 1 : currentIndex - 1]);
        });

        const sortable = new Sortable($sidebar.elSpaces, {
            draggable: '.space',
            handle: '.options .ib-move',
            preventOnFilter: true,
            animation: 150,
            fallbackOnBody: true,
            invertSwap: true,
            direction: 'horizontal'
        });
    }
}


export const $spaces = new Spaces();