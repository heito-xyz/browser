import { ipcMain } from 'electron';

// * Utils
import { $accounts } from './accounts';

// * Types
import type { TypeItem, TypeParent } from '../types';
import type { Profile } from '../types/profile';
import type { Space } from '../types/space';
import type { Folder } from '../types/folder';
import type { Tab } from '../types/tab';


class Config {
    private nameItems = ['profile', 'space', 'folder', 'tab'];

    constructor() {
        this.initEvents();

        console.log('Init config');
    }


    private initEvents() {
        ipcMain.on('test', (event, a) => {
            console.log(a);
            
        });
        // * Load
        ipcMain.on('config:items', (event, { type, items = 'all' }: { type: TypeItem, items: 'all' | 'archive' | 'delete' }) => {
            if (!type || !this.nameItems.includes(type)) return;

            const account = $accounts.current;

            if (!account) return;

            let list = (account.getConfigData(type + 's') as Array<any>).filter(item => {
                return items === 'all' ? !item['delete'] && !item['archive'] : item[items] === true;
            });
        
            event.reply('config:items', list);
        });


        // * New
        ipcMain.on('config:profiles:new', (event, { name, icon }: Pick<Profile, 'name' | 'icon'>) => {
            if (!$accounts.current) return;

            const newProfile = $accounts.current?.newProfile(name, icon);

            event.reply('config:profiles:new', newProfile);
        });

        ipcMain.on('config:spaces:new', (event, { name, icon, profileId }: Pick<Space, 'name' | 'icon' | 'profileId'>) => {
            if (!$accounts.current) return;
            
            const newSpace = $accounts.current?.newSpace(name, icon, profileId);

            event.reply('config:spaces:new', newSpace);
        });

        ipcMain.on('config:folders:new', (event, { name, icon, parent }: Pick<Folder, 'name' | 'icon' | 'parent'>) => {
            if (!$accounts.current) return;

            const [type, id, line] = parent.split(':') as TypeParent;
            
            const newFolder = $accounts.current?.newFolder(name, icon, [type, id, line]);

            event.reply('config:folders:new', newFolder);
        });

        ipcMain.on('config:tabs:new', (event, { name, url, parent }: Pick<Tab, 'name' | 'url' | 'parent'>) => {
            if (!$accounts.current) return;

            const [type, id, index, ...flags] = parent.split(':') as TypeParent;

            const newTab = $accounts.current?.newTab(name, url, [type, id, index, ...flags]);

            event.reply('config:tabs:new', newTab);
        });


        // * Update
        ipcMain.on('config:items:update', (event, { type, id, body }: { type: TypeItem, id: string, body: any }) => {
            if (!id || !this.nameItems.includes(type) || !body) return;

            const account = $accounts.current;

            if (!account) return;

            const item = account.updateItem(type, id, body);

            if (!item) return;

            event.reply('config:items:update', item);
        });


        // * Remove
        ipcMain.on('config:items:remove', (event, { type, id, action }: { type: TypeItem, id: string, action: 'archive' | 'delete' }) => {
            if (!this.nameItems.includes(type) || !['archive', 'delete'].includes(action)) return;

            const account = $accounts.current;

            if (!account) return;

            const item = account.updateItem(type, id, {
                [action]: true
            });

            if (!item) return;

            event.reply('config:items:remove', item);
        });
    }
}


export const $config = new Config();