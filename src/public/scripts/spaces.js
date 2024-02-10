import { $views } from './views.js';
import { $pages, Page } from './pages.js';
import { $folders, Folder } from './folders.js';


const elSpaces = document.querySelector('main .spaces');


class Space {
    /**
     * @readonly
     * @type { Number }
    */
    id = $spaces.list.size;


    list = [];

    /**
     * @param { String } icon
     * @param { String } name
    */
    constructor(icon, name) {
        this.icon = icon;
        this.name = name;

        /**
         * @readonly
         * @type { HTMLElement }
        */
        this.node = this.initNode();
    }


    /**
     * @param { Folder } folder
     * @param { InsertPosition } position
    */
    addFolder(folder, position = 'beforebegin') {
        this.list.push(folder);

        this.node.querySelector('.content .new-tab').insertAdjacentElement(position, folder.node);
    }

    /**
     * @param { Page } page
     * @param { InsertPosition } position
    */
    addPage(page, position = 'beforebegin') {
        this.list.push(page);

        this.node.querySelector('.content .new-tab').insertAdjacentElement(position, page.node);
    }


    /**
     * @param { String } url
    */
    newTab(url) {
        if (!url) return;

        const page = $pages.create(url);

        this.addPage(page, 'afterend');

        page.open();

        return {
            page
        }
    }


    initNode() {
        const space = document.createElement('div');

        space.className = 'space';
        space.innerHTML += `<div class="header"><i class="${this.icon}"></i><span>${this.name}</span></div>`;
        space.innerHTML += `<div class="content"><div class="new-tab"><i class="ib-plus"></i><span>New Tab</span></div></div>`;
        
        const content = space.querySelector('.content');

        content.prepend(...this.list);

        const newTab = space.querySelector('.new-tab');

        newTab.onclick = () => {
            this.newTab('https://ya.ru');
        }

        elSpaces.appendChild(space);

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
        if (!this.list.has(this.currentId)) return null;

        return this.list.get(this.currentId);
    }


    /**
     * @param { String } icon
     * @param { String } name
    */
    create(icon, name) {
        const space = new Space(icon, name);

        this.list.set(space.id, space);

        return space;
    }


    /**
     * @param { Number } id 
     */
    set(id) {
        id = Number(id);

        if (!this.list.has(id)) return;
        
        const space = this.list.get(id);

        this.currentId = id;

        elSpaces.querySelectorAll('.space').forEach(space => {
            space.classList.remove('active');
        });

        space.node.classList.add('active');

        elSpaces.style['transform'] = `translateX(calc(-100% * ${id}))`;
    }
}


export const $spaces = new Spaces();