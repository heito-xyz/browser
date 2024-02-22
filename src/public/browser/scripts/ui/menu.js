// * Global
import { $contextMenu } from '../../../global/scripts/contextMenu.js';

// * Libs
import { $ipc } from '../ipc.js';

// * Items
import { $profiles } from '../items/profiles.js';
import { $spaces } from '../items/spaces.js';
import { $folders } from '../items/folders.js';


class Menu {
    /**
     * @readonly
     * @type { HTMLElement }
    */
    el = document.querySelector('main .panel .b.menu');

    constructor() {
        this.initButtonAccount();
        this.initButtonSettings();
    }


    /**
     * @private
    */
    initButtonAccount() {
        const button = this.el.querySelector('.account');

        button.addEventListener('click', () => {
            $contextMenu.set([
                {
                    type: 'button',
                    label: 'Account',
                    icon: 'stars'
                }
            ], {
                fixed: true,
                el: button,
                position: ['top', 'left']
            })
        });
    }


    /**
     * @private
    */
    initButtonSettings() {
        const button = this.el.querySelector('i');

        button.addEventListener('click', () => {
            $contextMenu.set([
                {
                    type: 'button',
                    label: 'New space',
                    icon: 'stars',
                    click: async () => {
                        const [_, newSpace] = await $ipc.send('config:spaces:new', {
                            name: `Space - ${Date.now()}`,
                            profileId: 'global'
                        });
                        
                        const space = $spaces.insert(newSpace);

                        console.log('New Space:', space);
                    }
                },
                {
                    type: 'button',
                    label: 'New folder',
                    icon: 'folder',
                    click: async () => {
                        if (!$spaces.current?.id) return;

                        const [_, newFolder] = await $ipc.send('config:folders:new', {
                            name: `Folder - ${Date.now()}`,
                            parent: `space:${$spaces.current.id}:0`
                        });

                        const folder = $folders.insert(newFolder, true);

                        console.log('New Folder:', folder);
                    }
                },
                { type: 'separator' },
                {
                    type: 'button',
                    label: 'Settings',
                    icon: 'settings'
                }
            ], {
                fixed: true,
                el: button,
                position: ['top', 'right']
            })
        });
    }
}

export const $menu = new Menu();