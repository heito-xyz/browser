import { $views } from './views.js';

export class Page {
    /**
     * @readonly
     * @type { Number }
    */
    id = $pages.list.size;
    
    /**
     * @private
     * @type { Number | null }
    */
    _viewId = null;

    /**
     * @param { String } url
    */
    constructor(url) {
        /** @readonly */
        this.url = url;
        this._title = this.url;
        this._image = `https://www.google.com/s2/favicons?domain=${this.url}`;
    
        /**
         * @readonly
         * @type { HTMLElement }
        */
        this.node = this.initNode();
    }


    get title() {
        return this._title;
    }

    get image() {
        return this._image;
    }

    get viewId() {
        return this._viewId;
    }


    open() {
        if (this.viewId === null || !$views.list.has(this.viewId)) {
            const view = $views.create(this.url, true);

            this._viewId = view.id;
        } else if ($views.currentId !== this.viewId) {
            $views.setView(this.viewId);
        }

        const classes = this.node.classList;

        if (classes.contains('active')) return;

        const pages = document.querySelectorAll('.space.active .page.active');

        pages.forEach(page => {
            page.classList.remove('active');
        });

        classes.add('active');
    }


    /**
     * @param { String } title
    */
    setTitle(title) {
        const element = this.node.querySelector('img + span');

        if (!element) return false;

        element.textContent = title;
        this._title = title;

        return true;
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


    initNode() {
        const page = document.createElement('div');
    
        page.className = 'page';
        page.innerHTML = `<img src="${this.image}" alt="Page Image"><span>${this.title}</span>`;
    
        page.onclick = () => {
            this.open();
        }

        return page;
    }
}

class Pages {
    /**
     * @readonly
     * @type { Map<Number, Page> }
    */
    list = new Map();

    
    /**
     * @param { Number } viewId
    */
    getByViewId(viewId) {
        for (const [_, page] of this.list) {
            if (page.viewId === viewId) return page;
        }

        return null;
    }
    
    
    /**
     * @param { String } url
    */
    create(url) {
        const page = new Page(url);

        this.list.set(page.id, page);

        return page;
    }
}

export const $pages = new Pages();