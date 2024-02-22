import { $profiles } from '../items/profiles.js';
import { $spaces } from '../items/spaces.js';
import { $folders } from '../items/folders.js';
import { $tabs } from '../items/tabs.js';
import { $config } from '../config.js';

// * Libs
import { Sortable } from '../../../global/libs/sortable.js';


/**
 * @param { 'profile' | 'space' | 'folder' | 'tab' } type
 * @param { String } id
*/
export function getItem(type, id) {
    const types = {
        profile: $profiles.list,
        space: $spaces.list,
        folder: $folders.list,
        tab: $tabs.list
    };

    const item = types[type]?.get(id);

    return item || null;
}


/**
 * @param { String } parent
*/
export function getDataParent(parent) {
    const [type = '', id = '', index = '', ...flags] = parent.split(':');

    return {
        type,
        id,
        inline: flags.includes('inline'),
        index: Number(index),
        flags
    }
}


class Item {
    /**
     * @readonly
     * @type { HTMLElement }
    */
    node;


    /**
     * @param { Object } item
     * @param { String } item.id
     * @param { String } item.name
     * @param { Number } item.updatedAt
     * @param { Number } item.createdAt
     * 
     * @param { 'profile' | 'space' | 'folder' | 'tab' } type
     * 
     * @param { Object } options
     * @param { Array.<'parent' | 'items'> } options.flags
     * @param { String | { index: string, position: string, inline: string } } options.selector
    */
    constructor(item, type, options) {
        /**
         * @readonly
         * @type { String }
        */
        this.id = item.id;
        /**
         * @readonly
         * @type { String }
        */
        this.name = item.name;
        /**
         * @readonly
         * @type { Number }
        */
        this.createdAt = item.createdAt;
        /**
         * @readonly
         * @type { Number }
        */
        this.updatedAt = item.updatedAt;


        /**
         * @readonly
         * @type { 'profile' | 'space' | 'folder' | 'tab' }
        */
        this.type = type;


        /**
         * @readonly
        */
        this.options = options;

        
        /**
         * @private
         * @type { Boolean }
        */
        this.canUsedParent = this.options.flags.includes('parent');

        /**
         * @private
         * @type { Boolean }
        */
        this.canUsedItems = this.options.flags.includes('items');

        // * Flag - Parent
        if (this.canUsedParent) {
            /**
             * @private
             * @type { String }
            */
            this._parent = item.parent;
        }

        // * Flag - Items
        if (this.canUsedItems) {
            /**
             * @private
             * @type { Array.<{ type: 'folder' | 'tab', id: string }> }
            */
            this.items = [];

            /**
             * @private
             * @type { String }
            */
            this.selector = options.selector;
        }
    }


    get parent() {
        if (!this.canUsedParent) return {};

        return getDataParent(this._parent);
    }

    get space() {
        if (!this.canUsedParent) return null;

        const { type, id } = this.parent;

        let spaceId = id;

        if (type === 'folder') {
            spaceId = this.checkSpaceIdInParent(type, id);

            if (!spaceId) return null;
        }

        return $spaces.list.get(spaceId);
    }


    /**
     * @private
     * @param { 'space' | 'folder' } type
     * @param { String } id
     * @return { String | null }
    */
    checkSpaceIdInParent(type, id) {
        if (!this.canUsedParent) return null;

        const parent = getItem(type, id);

        if (!parent) return null;

        const { type: parentType, id: parentId } = parent.parent;

        if (parentType === 'space') return parentId;
        else if (parentType === 'folder') {
            return this.checkSpaceIdInParent(parentType, parentId);
        }
    }


    // * Set
    /**
     * @param { String } name
    */
    setName(name) {
        const element = this.node.querySelector('.item-name');

        if (!element) return false;

        element.textContent = name;
        this.name = name;

        $config.updateItem(this.type, this.id, {
            name
        });

        return true;
    }

    /**
     * @param { 'space' | 'folder' } type
     * @param { String } id
     * @param { Array<string> } args
    */
    setParent(type, id, ...args) {
        if (!this.canUsedParent) return null;

        this._parent = `${type}:${id}:${args.join(':')}`;

        $config.updateItem(this.type, this.id, {
            parent: this._parent
        });
    }


    /**
     * @public
     * @param { String } container
    */
    insertToParent(container) {
        if (!this.canUsedParent) return;

        const { type, id, inline, index } = this.parent;

        const parent = getItem(type, id);

        if (!parent) return;

        parent.addItem(this.type, this.id, {
            mode: inline ? 'position' : 'index',
            index,
            container
        });
    }


    /**
     * @param { 'folder' | 'tab' } type
     * @param { String } id
     * 
     * @param { Object } options
     * @param { 'position' | 'index' } options.mode
     * @param { 'start' | 'end' } options.position
     * @param { Number } options.index
     * @param { String } options.container
    */
    addItem(type, id, options = { position: 'start' }) {
        if (!this.canUsedItems) return false;

        const item = getItem(type, id);

        if (!item) return false;
        
        this.items.push({ type, id });

        const selector = options.container || typeof this.selector === 'string' ?
            this.selector :
            (this.selector[item.parent.inline && this.selector['inline'] ? 'inline' : options.mode]);

        const container = this.node.querySelector(selector);

        // if (options.mode === 'position') {
        //     container.insertAdjacentElement(options?.position || 'beforebegin', item.node);
        // } else if (options.mode === 'index') {
        // }
        container[options.position === 'start' ? 'prepend' : 'appendChild'](item.node);

        return true;
    }



    /**
     * @param { HTMLElement } container 
    */
    updateIndexItemsInParent(container, parentType, parentId, inline = false) {
        container.childNodes.forEach(node => {
            const { type: itemType, id: itemId } = getDataParent(node.id);

            if (!itemType || !itemId) return;

            const item = getItem(itemType, itemId);

            if (!item) return;

            const newIndex = Array.prototype.indexOf.call(container.childNodes, node);

            const { type, id, index } = item.parent;

            if (index === newIndex && parentId === id) return;

            const newParent = [parentType, parentId, newIndex];

            if (inline) newParent.push('inline');

            item.setParent(...newParent);
        });
    }

    /**
     * @param { HTMLElement } container
     * @param { Object } sortableOptions
     * @param { Boolean } [inline=false]
    */
    initSortable(container, sortableOptions, inline = false) {
        /** @type { Sortable } */
        const sortable = new Sortable(container, {
            ...sortableOptions,
            preventOnFilter: true,
            animation: 150,
            fallbackOnBody: true,
            invertSwap: true,

            /**
             * @param { Object } e
             * @param { HTMLElement } e.item
             * @param { Number } e.newIndex
            */
            onAdd: ({ item: dragItem, newIndex }) => {
                this.updateIndexItemsInParent(container, this.type, this.id, inline);
            },

            /**
             * @param { Object } e
             * @param { HTMLElement } e.item
             * @param { Number } e.newIndex
            */
            onUpdate: ({ item: dragItem, newIndex }) => {
                this.updateIndexItemsInParent(container, this.type, this.id, inline);
            }
        });

        return sortable;
    }


    // *
    remove() {}
}


class ItemItems extends Item {
    /**
     * @private
     * @type { Array.<{ type: 'folder' | 'tab', id: string }> }
    */
    items = [];

    /**
     * @private
     * @type { String }
    */
    selector;
    

    /**
     * @param { Object } item
     * @param { 'profile' | 'space' | 'folder' | 'tab' } type
     * @param { String } selector 
    */
    constructor(item, type, selector) {
        super(item, type);

        this.selector = selector;
    }


    /**
     * @param { 'folder' | 'tab' } type
     * @param { String } id
     * 
     * @param { Object } options
     * @param { 'position' | 'index' } options.mode
     * @param { InsertPosition } options.position
     * @param { Number } options.index
    */
    addItem(type, id, options = { position: 'beforebegin' }) {
        const item = getItem(type, id);

        if (!item) return false;
        
        this.items.push({ type, id });

        const container = this.node.querySelector(this.selector);

        if (options.mode === 'position') {
            container.insertAdjacentElement(options.position, item.node);
        } else if (options.mode === 'index') {
            container.insertBefore(item.node, container.childNodes[options.index]);
        }

        return true;
    }
}


export {
    Item
}