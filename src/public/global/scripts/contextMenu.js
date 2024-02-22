/**
 * @typedef ContextMenuOptions
 * 
 * @type { Object }
 * @property { Object } options
 * @property { Boolean } fixed
 * @property { 'corner' | 'center' } mode
 * @property { 'vertical' | 'horizontal' } orientation
 * @property { HTMLElement } el
 * @property { Array<'top' | 'right' | 'bottom' | 'left'> } position
*/


/**
 * @callback ContextMenuItemClick
 * 
 * @param { Event } event
*/

/**
 * @typedef ContextMenuItem
 * 
 * @type { Object }
 * @property { !('button' | 'separator') } type
 * @property { !String } label
 * @property { ?String } icon
 * @property { ?String } text
 * @property { ContextMenuItemClick } click
*/



class ContextMenu {
    /**
     * @private
     * @type { HTMLElement }
    */
    node;

    /**
     * @private
     * @type { Event | null }
    */
    event = null;

    
    /**
     * @private
     * @type { ContextMenuOptions }
    */
    options = {};


    close() {
        this.node.style.display = 'none';
    }


    /**
     * @private
    */
    listenEventClose() {
        window.addEventListener('click', event => {
            const path = event.path || (event.composedPath ? event.composedPath() : undefined);
            
            if (path && (path.includes(this.node) || path.includes(this.event))) return this.listenEventClose(this.node);
    
            this.close();
        }, {
            once: true,
            capture: true
        });
    
        window.addEventListener('scroll', () => {
            this.close();
        }, {
            capture: true,
            once: true
        });
    }


    /**
     * @private
    */
    setPosition() {
        const {
            mode = 'corner',
            orientation = 'vertical',
            fixed = false,
            position = ['top', 'right'],
            el
        } = this.options;

        const { clientWidth, clientHeight } = this.node;

        let x = this.event.clientX,
            y = this.event.clientY,
            gap = [8, 8];

        if (fixed && el) {
            const { width, height, top, left } = el.getBoundingClientRect();

            const width2 = width / 2;
            const height2 = height / 2;
            
            x = left + width2;
            y = top + height2;
            gap = [width2, height2];
        }

        if (mode === 'corner') {
            if (orientation === 'vertical') {
                if (position.includes('left')) {
                    x = x - gap[0];
                } else if (position.includes('right')) {
                    x = x + gap[0] - clientWidth;
                }

                if (position.includes('top')) {
                    y -= gap[1] + clientHeight + 8;
                } else if (position.includes('bottom')) {
                    y += gap[1] + 8;
                }
            } else if (orientation === 'horizontal') {
                if (position.includes('left')) {
                    x -= gap[0] + clientWidth + 8;
                } else if (position.includes('right')) {
                    x += gap[0] + 8;
                }

                if (position.includes('top')) {
                    y -= gap[1];
                } else if (position.includes('bottom')) {
                    y = y + gap[1] - clientHeight;
                }
            }
        }

        // if (position.includes('top')) {
        //     y -= clientHeight + 12;
        // }

        // if (position.includes('left')) {
        //     x -= clientWidth + 12;
        //     x += el.clientWidth + 12;
        // }

        // if (y + clientHeight > window.innerHeight) {
        //     y = window.innerHeight - 12 - clientHeight;
        // }

        return { x, y };
    }


    /**
     * @param { Array<ContextMenuItem> } items
     * 
     * @param { ContextMenuOptions } options
    */
    set(items, options = {}) {
        const event = window.event;

        const ul = this.node.querySelector('ul');

        ul.innerHTML = '';

        for (const item of items) {
            const itemElement = document.createElement('li');
    
            itemElement.className = item.type;
    
            if (item.type === 'button') {
                if (item.icon) itemElement.innerHTML += `<i class="ib-${item.icon}"></i>`;
                
                itemElement.innerHTML += `
                <div>
                    <div>${item.label}</div>
                    <div>${item.text || ''}</div>
                </div>
                `;
    
                if (item?.click) {
                    itemElement.addEventListener('click', event => {
                        item.click(event);

                        $contextMenu.close();
                    });
                }
            }
    
            ul.appendChild(itemElement);
        }

        this.event = event;

        this.options = options;
        
        this.node.style.display = 'block';

        const { x, y } = this.setPosition();

        this.node.style.top = y + 'px';
        this.node.style.left = x + 'px';

        setTimeout(() => this.listenEventClose(), 10);
    }


    /**
     * @param { HTMLElement } container
     * @param { String } stylePath
    */
    init(container, stylePath = '../global/styles/contextMenu.css') {
        if (!container) return;

        const head = document.querySelector('html head');

        const link = document.createElement('link');

        link.rel = 'stylesheet';
        link.href = stylePath;

        head.appendChild(link);

        const contextMenuElement = document.createElement('div');

        contextMenuElement.className = 'context-menu';
        contextMenuElement.style.display = 'none';

        contextMenuElement.innerHTML = `
        <ul></ul>
        `;

        container.appendChild(contextMenuElement);

        this.node = contextMenuElement;
    }
}

export const $contextMenu = new ContextMenu();