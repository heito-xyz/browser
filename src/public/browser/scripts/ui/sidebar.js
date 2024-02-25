class Sidebar {
    /**
     * @readonly
     * @type { HTMLElement }
    */
    el = document.querySelector('main > .sidebar');

    /**
     * @readonly
     * @type { HTMLElement }
    */
    elTitlebar = this.el.querySelector('& > .titlebar');

    /**
     * @readonly
     * @type { HTMLElement }
    */
    elSearch = this.el.querySelector('& > .search');

    /**
     * @readonly
     * @type { HTMLElement }
    */
    elSpaces = this.el.querySelector('& > div.spaces');

    /**
     * @readonly
     * @type { HTMLElement }
    */
    elMenu = this.el.querySelector('& > div.b.menu');

    /**
     * @private
     * @type { HTMLElement }
    */
   elResizeLine = this.el.querySelector('& > .resize-line');


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


    // * 
    show() {
        this._active = true;

        this.el.classList.add('active');
    }

    hide() {
        this._active = false;

        this.el.classList.remove('active');
    }

    toggle() {
        this[this._active ? 'hide' : 'show']();
    }


    // * Inits
    /**
     * @private
    */
    initResizeLine() {
        let drag = false;

        /**
         * @param { MouseEvent } event
        */
        const mouseMove = event => {
            if (!drag) return;

            let size = event.screenX;

            if (size < 215) size = 215;
            if (size > 376) size = 376;

            this.el.style.setProperty('--width', size + 'px');
        }
        
        this.elResizeLine.addEventListener('mousedown', () => {
            drag = true;

            this.el.classList.add('resize');

            window.addEventListener('mousemove', mouseMove);

            window.addEventListener('mouseup', () => {
                drag = false;

                console.log('end');
                this.el.classList.remove('resize');

                window.removeEventListener('mousemove', mouseMove);
            }, { capture: true });
        });
    }

    /**
     * @private
    */
    init() {
        this.initResizeLine();
    }
}

export const $sidebar = new Sidebar();