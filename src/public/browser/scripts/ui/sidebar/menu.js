// * UI
import { $sidebar } from './index.js';
import { $views } from '../views.js';

// * Components
import { archiveMenuComponent } from '../../components/menu/archive.js';


class Menu {
    /**
     * @private
     * @type { HTMLElement }
    */
    el = $sidebar.elMenu;

    /**
     * @private
     * @type { HTMLElement }
    */
    elComponents = $sidebar.el.querySelector('& > .menu-components');


    /**
     * @private
     * @type { Map<string, HTMLElement> }
    */
    components = new Map();


    // *
    /**
     * @private
     * @type { Boolean }
    */
    _active = true;


    constructor() {
        this.init();
    }


    // * Getters
    get isActive() {
        return this._active;
    }


    // * Show and Hide
    show() {
        this._active = true;

        $sidebar.el.classList.add('show-menu');
    }

    hide() {
        this._active = false;

        $sidebar.el.classList.remove('show-menu', 'spaces-settings', 'archive');
    }

    toggle() {
        this[this._active ? 'hide' : 'show']();
    }


    // *
    /**
     * @private
    */
    setComponent(name) {
        const components = {
            'archive': archiveMenuComponent
        };

        if (!components[name]) return false;

        this.components.forEach((component, key) => {
            component.style.display = key === name ? '' : 'none';
        });

        if (!this.components.has(name)) {
            const component = components[name]();

            this.components.set(name, component);
        
            this.elComponents.appendChild(component);
        }

        return true;
    }

    /**
     * @private
     * @param { 'archive' | 'spaces' } name 
    */
    setMenu(name) {
        const classes = {
            'archive': 'archive',
            'spaces': 'spaces-settings'
        };

        if (!classes[name]) return false;

        $sidebar.el.classList.remove('spaces-settings', 'archive');
        $sidebar.el.classList.add('active', classes[name]);

        this.setComponent(name);

        return true;
    }


    // * Inits
    /**
     * @private
    */
    init() {
        const btnBack = this.el.querySelector('.btn.back');

        btnBack.addEventListener('click', () => {
            this.hide();
        });

        const icons = {
            // 'trash': () => {
            //     console.log('trash')
            // },
            // 'clipboard': () => {
            //     console.log('clipboard');
            // },
            // 'file-text': () => {
            //     console.log('files');
            // },
            // 'image': () => {
            //     console.log('media');
            // },
            // 'download': () => {
            //     console.log('download');
            // },
            'layers': () => {
                this.setMenu('spaces');
            },
            'archive': () => {
                this.setMenu('archive');
            },
            'settings': async () => {
                const { pageSettings } = await import('../../pages/settings/index.js');

                $views.create({
                    mode: 'page',
                    page: pageSettings.page
                });
            }
        };

        for (const iconName in icons) {
            const btn = document.createElement('div');

            btn.className = 'btn';
            btn.innerHTML = `<i class="ib-${iconName}"></i>`;

            btn.addEventListener('click', icons[iconName]);

            this.el.prepend(btn);
        }
    }
}

export const $menu = new Menu();