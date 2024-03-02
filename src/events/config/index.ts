import { EventListener } from '..';

// * Libs
import { $accounts } from '../../libs/accounts';

// * Types
import type { TypeItem, TypeParent } from '../../types';
import type { Profile } from '../../types/profile';
import type { Space } from '../../types/space';
import type { Folder } from '../../types/folder';
import type { Tab } from '../../types/tab';


export const nameItems = ['profile', 'space', 'folder', 'tab'];


const event = new EventListener('configs');


// * Group - Items | g = group :D
const gItems = event.group('items');

//#region Items

gItems.send('', (event, { type, items = 'all' }: { type: TypeItem, items: 'all' | 'archive' | 'delete' }) => {
    if (!type || !nameItems.includes(type)) return [];

    const account = $accounts.current;

    if (!account) return [];

    const list = (account.getConfigData(type + 's') as Array<any>).filter(item => {
        return items === 'all' ? !item['delete'] && !item['archive'] : item[items] === true;
    });

    return list;
});

gItems.send('update', (event, { type, id, body }: { type: TypeItem, id: string, body: any }) => {
    if (!id || !nameItems.includes(type) || !body) return;

    const account = $accounts.current;

    if (!account) return;

    const item = account.updateItem(type, id, body);

    if (!item) return;

    return item;
});

gItems.send('remove', (event, { type, id, action }: { type: TypeItem, id: string, action: 'archive' | 'delete' }) => {
    if (!nameItems.includes(type) || !['archive', 'delete'].includes(action)) return;

    const account = $accounts.current;

    if (!account) return;

    const item = account.updateItem(type, id, {
        [action]: true
    });

    if (!item) return;

    return item;
});

//#endregion


//#region Create New Item

event.send('profiles:new', (event, { name, icon }: Pick<Profile, 'name' | 'icon'>) => {
    if (!$accounts.current) return;

    const newProfile = $accounts.current?.newProfile(name, icon);

    return newProfile;
});

event.send('spaces:new', (event, { name, icon, profileId }: Pick<Space, 'name' | 'icon' | 'profileId'>) => {
    if (!$accounts.current) return;
    
    const newSpace = $accounts.current?.newSpace(name, icon, profileId);

    return newSpace;
});

event.send('folders:new', (event, { name, icon, parent }: Pick<Folder, 'name' | 'icon' | 'parent'>) => {
    if (!$accounts.current) return;

    const [type, id, line] = parent.split(':') as TypeParent;
    
    const newFolder = $accounts.current?.newFolder(name, icon, [type, id, line]);

    return newFolder;
});

event.send('tabs:new', (event, { name, url, parent }: Pick<Tab, 'name' | 'url' | 'parent'>) => {
    if (!$accounts.current) return;

    const [type, id, index, ...flags] = parent.split(':') as TypeParent;

    const newTab = $accounts.current?.newTab(name, url, [type, id, index, ...flags]);

    return newTab;
});

//#endregion

// * Dialog
// send('dialog:files', (event) => {
//     dialog.showOpenDialog({
//         properties: ['openFile'],
//         filters: [
//             { name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'gif'] }
//         ]
//     }).then(({ filePaths }) => {
//         event.reply('dialog:files', filePaths);
//     });
// });