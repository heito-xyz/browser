import { $titlebar } from './titlebar.js';
import { $pages } from './pages.js';

const views = document.querySelector('main .views');


class View {
    /**
     * @readonly
     * @type { Number }
    */
    id = $views.list.size;

    /**
     * @param { String } url
    */
    constructor(url) {
        this.url = url;

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


    initNode() {
        const view = document.createElement('div');

        view.id = String(this.id);
        view.className = 'view';

        const webview = document.createElement('webview');

        webview.src = this.url;
        webview.setAttribute('allowpopups', 'true');
        webview.setAttribute('autosize', 'true');

        view.appendChild(webview);

        return view;
    }
}


class Views {
    /**
     * @readonly
     * @type { Map<Number, View> }
    */
    list = new Map();

    /**
     * @readonly
     * @type { Number | null }
    */
    currentId = null;

    constructor() {}


    getCurrentView() {
        if (this.currentId === null || !this.list.has(this.currentId)) return null;

        const view = this.list.get(this.currentId);

        return view;
    }


    /**
     * @param { Number } id
    */
    setView(id) {
        id = Number(id);

        if (!this.list.has(id)) return;

        const view = this.list.get(id);

        this.currentId = null;

        for (const [_, view] of this.list) {
            const is = view.id === id;

            if (is) this.currentId = id;

            view.node.style['display'] = is ? 'block' : 'none';
        }

        if (this.currentId === null) {
            views.appendChild(view.node);

            this.currentId = view.id;
        }

        if (this.currentId === null) return;

        this.setCurrentViewEvents();
    }


    setCurrentViewEvents() {
        const view = this.getCurrentView();

        if (!view) return;

        const webview = view.webview;

        webview.addEventListener('dom-ready', event => {
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
        
        webview.addEventListener('page-title-updated', event => {
            const page = $pages.getByViewId(view.id);

            if (!page) return null;

            page.setTitle(event.title);
        });

        webview.addEventListener('page-favicon-updated', event => {
            const page = $pages.getByViewId(view.id);
            
            if (!page) return null;

            page.setImage(event.favicons[0]);
        });

        // const event = (name) => {
        //     console.log('init event', name)
        //     webview.addEventListener(name, (...args) => {
        //         console.log(name, '->', args);
        //     });
        // }

        // const events = ['did-create-window', "load-commit","did-finish-load","did-fail-load","did-frame-finish-load","did-start-loading","did-stop-loading","did-attach","dom-ready","page-title-updated","page-favicon-updated","enter-html-full-screen","leave-html-full-screen","console-message","found-in-page","will-navigate","will-frame-navigate","did-start-navigation","did-redirect-navigation","did-navigate","did-frame-navigate","did-navigate-in-page","close","ipc-message","crashed-deprecated","render-process-gone","plugin-crashed","destroyed","media-started-playing","media-paused","did-change-theme-color","update-target-url","devtools-open-url","devtools-opened","devtools-closed","devtools-focused","context-menu"];


        // for (const name of events) {
        //     event(name);
        // }
    }


    /**
     * @param { String } url
     * @param { Boolean } show
    */
    create(url, added = false) {
        if (!url) return;

        const view = new View(url);

        this.list.set(view.id, view);

        if (added) {
            const listViews = views.querySelectorAll('.view');

            listViews.forEach(view => {
                view.style['display'] = 'none';
            });

            views.appendChild(view.node);
            
            this.currentId = view.id;

            this.setCurrentViewEvents();
        }

        return view;
    }
}


export const $views = new Views();