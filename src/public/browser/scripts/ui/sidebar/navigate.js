// * Global
import { $contextMenu } from '../../../../global/scripts/contextMenu.js';

// * Libs
import { $ipc } from '../../ipc.js';

// * UI
import { $sidebar } from './index.js';
import { $menu } from './menu.js';
import { $views } from '../views.js';

// * Items
import { $profiles } from '../../items/profiles.js';
import { $spaces } from '../../items/spaces.js';
import { $folders } from '../../items/folders.js';


class Navigate {
    /**
     * @readonly
     * @type { HTMLElement }
    */
    el = $sidebar.elNavigate;

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
                },
                { type: 'separator' },
                {
                    type: 'button',
                    label: 'Settings',
                    icon: 'settings',
                    click: () => {
                        $menu.show();
                    }
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
                        const newSpace = await $ipc.invoke('configs:spaces:new', {
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
                    icon: 'folder-solid',
                    click: async () => {
                        if (!$spaces.current?.id) return;

                        const newFolder = await $ipc.invoke('configs:folders:new', {
                            name: `Folder - ${Date.now()}`,
                            parent: `space:${$spaces.current.id}:0`
                        });

                        const folder = $folders.insert(newFolder, true);

                        console.log('New Folder:', folder);
                    }
                }
            ], {
                fixed: true,
                el: button,
                position: ['top', 'right']
            })
        });
    }
}

export const $navigate = new Navigate();