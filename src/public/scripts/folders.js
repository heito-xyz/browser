import { Page } from './pages.js';

export class Folder {
    /**
     * @readonly
     * @type { Number }
    */
    id = $folders.list.size;

    /**
     * @private
     * @type { String }
    */
    _name;

    /**
     * @private
     * @type { Map<Number, Page> }
    */
    pages = new Map();

    /**
     * @param { String } name
    */
    constructor(name) {
        this._name = name;

        /** @readonly */
        this.node = this.initNode();
    }


    /**
     * @return { String }
    */
    get name() {
        return this._name;
    }


    /**
     * @param { Page } page
    */
    addPage(page) {
        this.pages.set(page.id, page);

        const listPages = this.node.querySelector('ul');

        listPages.appendChild(page.node);
    }


    initNode() {
        const folder = document.createElement('div');

        folder.className = 'folder';

        folder.innerHTML += `<div class="header"><i class="ib-settings"></i><span>${this.name}</span></div>`;
        folder.innerHTML += '<ul></ul>';

        const header = folder.querySelector('.header');
        const listPages = folder.querySelector('ul');
    
        header.onclick = () => {
            listPages.classList.toggle('active');
        }

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
}

export const $folders = new Folders();