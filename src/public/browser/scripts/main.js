// * Global
import { $contextMenu } from '../../global/scripts/contextMenu.js';

// * Libs
import { $ipc } from './ipc.js';
import { $config } from './config.js';

// * UI
import { $sidebar } from './ui/sidebar/index.js';
import { $titlebar } from './ui/sidebar/titlebar.js';
import { $navigate } from './ui/sidebar/navigate.js';

// * Items
import { $spaces } from './items/spaces.js';
import { $tabs } from './items/tabs.js';
import { $folders } from './items/folders.js';
import { $profiles } from './items/profiles.js';

// * Elements
const elMain = document.querySelector('main');


// * Inits
$contextMenu.init(elMain);


// * Load Items
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



// 
$ipc.on('tabs:new', (event, tab) => {
    if (!$spaces.current) return;

    const newTab = $tabs.insert(tab);

    $spaces.current.addItem('tab', newTab.id, {
        mode: 'position',
        position: 'start'
    });

    $tabs.setCurrentTab(newTab.id);
});


window.addEventListener('keyup', event => {
    console.log(event);
})