/**
 * @typedef ItemFolder
 * 
 * @property { String } id
 * @property { String } name
 * @property { 'image' | 'icon' } icon.type
 * @property { String } icon.value
 * @property { String } parent
 * @property { Number } folder.updatedAt
 * @property { Number } folder.createdAt
*/


// * Libs
import { Sortable } from '../../../global/libs/sortable.js';
import { $config } from '../config.js';
import { $contextMenu } from '../../../global/scripts/contextMenu.js';
import { $ipc } from '../ipc.js';

// * Items
import { $spaces } from './spaces.js';
import { $tabs, Tab } from './tabs.js';

// * Classes
import { Item, getDataParent } from '../classes/item.js';

// * Components
import { selectIconComponent } from '../components/selectIcon.js';


export class Folder extends Item {
    /**
     * @param { String } name
     * @param { Number } spaceId
     * 
     * @param { ItemFolder } folder
    */
    constructor(folder) {
        super(folder, 'folder', {
            flags: ['parent', 'items'],
            selector: 'ul'
        });

        /** @readonly */
        this.id = folder.id;
        this.name = folder.name;
        this.icon = folder.icon || {
            type: 'icon',
            value: 'folder-solid'
        };
        /** @private */
        this._parent = folder.parent;
        this.items = folder.items;
        /** @readonly */
        this.createdAt = folder.createdAt;

        /**
         * @readonly
         * @type { HTMLElement }
        */
        this.node = this.initNode();

        this.setIcon(this.icon.type, this.icon.value);
    }


    // * Context Menus
    /** @private */
    setFolderContextMenu() {
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
                    }, 10)
                }
            },
            {
                type: 'button',
                label: 'Rename',
                click: () => {
                    const name = this.node.querySelector('.item-name');
                
                    name.setAttribute('contenteditable', true);
                    name.focus();

                    name.addEventListener('blur', () => {
                        name.setAttribute('contenteditable', false);

                        if (name.textContent !== this.name) this.setName(name.textContent);
                    }, true);
                }
            }
        ], {
            el: this.node.querySelector('.header'),
            fixed: true,
            position: ['bottom', 'right']
        });
    }


    /**
     * @private
    */
    initNode() {
        const folder = document.createElement('div');

        folder.id = `folder:${this.id}`;
        folder.className = 'folder';
        folder.innerHTML = `
        <div class="header">
            <div class="item-icon"></div>
            <div class="item-name">${this.name}</div>
        </div>
        <ul></ul>
        `;

        const header = folder.querySelector('.header');

        // ? Header Events
        header.addEventListener('click', () => {
            folder.classList.toggle('active');
        });

        header.addEventListener('contextmenu', () => {
            this.setFolderContextMenu();
        });

        const listTabs = folder.querySelector('ul');


        /** @type { Sortable } */
        this.sortable = this.initSortable(listTabs, {
            group: {
                name: `folder:${this.id}`,
                put: true
            },
            draggable: '.tab, .folder',
        }, false);


        return folder;
    }
}

class Folders {
    /**
     * @readonly
     * @type { Map<Number, Folder> }
    */
    list = new Map();

    
    /**
     * @param { String } name
    */
    create(name) {
        const folder = new Folder(name);

        this.list.set(folder.id, folder);

        return folder;
    }


    /**
     * @param { ItemFolder } folder
     * 
     * @param { Boolean } [isInsertToParent=false]
    */
    insert(folder, isInsertToParent = false) {
        const newFolder = new Folder(folder);

        this.list.set(folder.id, newFolder);

        if (isInsertToParent) newFolder.insertToParent();

        return newFolder;
    }

    /**
     * @param { Array<ItemFolder> } folders 
    */
    insertAll(folders) {
        for (const folder of folders) {
            this.insert(folder);
        }

        const filterFolders = folders.sort((a, b) => {
            const { index: aIndex } = getDataParent(a.parent);
            const { index: bIndex } = getDataParent(b.parent);

            return aIndex > bIndex ? 1 : -1;
        });

        for (const { id } of filterFolders) {
            const folder = this.list.get(id);

            if (!folder) continue;

            folder.insertToParent();
        }
    }
}

export const $folders = new Folders();