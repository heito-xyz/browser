// * Global
import { $contextMenu } from '../../global/scripts/contextMenu.js';

// * Libs
import { $ipc } from './ipc.js';
import { $config } from './config.js';

// * UI
import { $titlebar } from './ui/titlebar.js';
import { $menu } from './ui/menu.js';

// * Items
import { $spaces } from './items/spaces.js';
import { $tabs } from './items/tabs.js';
import { $folders } from './items/folders.js';
import { $profiles } from './items/profiles.js';


// * Elements
const
    elMain = document.querySelector('main'),
    elTitlebar = elMain.querySelector('.titlebar'),
    elSearch = elMain.querySelector('.search'),
    elSpaces = elMain.querySelector('.spaces'),
    elMenu = elMain.querySelector('.b.menu');


/** @type { HTMLElement} */
const menuSpaces = elMenu.querySelector('.spaces');


$contextMenu.init(elMain);


const spaces = await $config.getList('space');
const profiles = await $config.getList('profile');
const folders = await $config.getList('folder');
const tabs = await $config.getList('tab');


$profiles.insertAll(profiles);
$spaces.insertAll(spaces);
$folders.insertAll(folders);
$tabs.insertAll(tabs);

if ($spaces.list.size > 0) {
    $spaces.set([...$spaces.list][0][0]);
}


$ipc.on('tabs:new', (event, tab) => {
    if (!$spaces.current) return;

    const newTab = $tabs.insert(tab);

    $spaces.current.addItem('tab', newTab.id, {
        mode: 'position',
        position: 'start'
    });

    $tabs.setCurrentTab(newTab.id);
});


// const [newProfile] = elMain.querySelectorAll('.new');

// newProfile.addEventListener('click', async event => {
//     console.log('new profile');

//     const [e, profile] = await $ipc.send('config:profiles:new', { name: Date.now().toString() });

//     console.log(e, profile);
// });