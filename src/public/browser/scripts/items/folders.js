import { $spaces } from './spaces.js';
import { $tabs, Tab } from './tabs.js';

// * Libs
import { Sortable } from '../../../global/libs/sortable.js';
import { $config } from '../config.js';

// * Classes
import { Item, getDataParent } from '../classes/item.js';


export class Folder extends Item {
    /**
     * @readonly
     * @type { Number }
    */
    id = $folders.list.size;

    /**
     * @private
    */
    items = [];

    /**
     * @param { String } name
     * @param { Number } spaceId
     * 
     * @param { Object } folder
     * @param { String } folder.id
     * @param { String } folder.name
     * @param { String } folder.icon
     * @param { String } folder.parent
     * @param { Array.<{ type: 'folder' | 'tab', id: string }> } folder.items
     * @param { Number } folder.createdAt
    */
    constructor(folder) {
        super(folder, 'folder', {
            flags: ['parent', 'items'],
            selector: 'ul'
        });

        /** @readonly */
        this.id = folder.id;
        this.name = folder.name;
        this.icon = folder.icon;
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
    }


    // get parent() {
    //     const [type = '', id = '', index = ''] = this._parent.split(':');

    //     return {
    //         type,
    //         id,
    //         index: Number(index) 
    //     };
    // }

    // get space() {
    //     const { type, id } = this.parent;

    //     if (type === 'folder') {
    //         const spaceId = this.checkSpaceIdInFolder(id);

    //         if (!spaceId) return null;

    //         return $spaces.list.get(spaceId);
    //     }

    //     return $spaces.list.get(id);
    // }


    /**
     * @private
     * @param { String } folderId
     * @return { String | null }
    */
    // checkSpaceIdInFolder(folderId) {
    //     const folder = $folders.list.get(folderId);

    //     const { type, id } = folder.parent;

    //     if (type === 'space') return id;
    //     else if (type === 'folder') {
    //         return this.checkSpaceIdInFolder(id);
    //     }
    // }


    /**
     * @param { 'space' | 'folder' } type
     * @param { String } id
     * @param { Array<string> } args
    */
    // setParent(type, id, ...args) {
    //     this._parent = `${type}:${id}:${args.join(':')}`;

    //     $config.updateItem('folder', this.id, {
    //         parent: this._parent
    //     });
    // }


    /**
     * @param { 'folder' | 'tab' } type
     * @param { Number } id
     * @param { Number | null } index
    */
    // addItem(type, id, index) {
    //     const types = {
    //         folder: $folders.list,
    //         tab: $tabs.list
    //     }

    //     const item = types[type].get(id);

    //     if (!item) return false;

    //     this.items.push({ type, id });

    //     const list = this.node.querySelector('ul');

    //     if (index !== null) {
    //         list.insertBefore(item.node, list.childNodes[index]);
    //     } else {
    //         list.appendChild(item.node);
    //     }

    //     return true;
    // }


    // includeToParent() {
    //     const { type, id } = this.parent;

    //     const types = {
    //         space: $spaces.list,
    //         folder: $folders.list
    //     };

    //     const parent = types[type].get(id);

    //     if (!parent) return;

    //     parent.addItem('folder', this.id);
    // }


    /**
     * @private
     * @param { 'folder' | 'tab' } type
     * @param { String } id
     * @param { Number } newIndex
    */
    setParentItem(type, id, newIndex) {
        const types = {
            folder: $folders.list,
            tab: $tabs.list
        };

        const item = types[type].get(id);

        if (!item) return;

        item.setParent('folder', this.id, String(newIndex));
    }


    initNode() {
        const folder = document.createElement('div');

        folder.id = `folder:${this.id}`;
        folder.className = 'folder';
        folder.innerHTML = `
        <div class="header">
            <i class="ib-folder"></i>
            <div class="item-name" contenteditable="true">${this.name}</div>
        </div>
        <ul></ul>
        `;

        const header = folder.querySelector('.header');

        const folderName = header.querySelector('.item-name');

        let timerName;

        folderName.addEventListener('input', () => {
            clearTimeout(timerName);

            timerName = setTimeout(() => {
                this.setName(folderName.textContent);
            }, 700);
        });

        const listTabs = folder.querySelector('ul');
    
        header.onclick = () => {
            folder.classList.toggle('active');
        }


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
     * @param { Object } folder
     * @param { String } folder.id
     * @param { String } folder.name
     * @param { String } folder.icon
     * @param { String } folder.parent
     * @param { Number } folder.updatedAt
     * @param { Number } folder.createdAt
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
     * @param { Array.<{
     * id: string;
     * name: string;
     * icon: string;
     * parent: string;
     * updatedAt: number;
     * createdAt: number;
     * }> } folders 
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