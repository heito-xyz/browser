import { $ipc } from './ipc.js';

import { $titlebar } from './ui/titlebar.js';
import { $spaces } from './items/spaces.js';
import { $tabs } from './items/tabs.js';
import { $folders } from './items/folders.js';
import { $config } from './config.js';
import { $profiles } from './items/profiles.js';



// * Elements
const
    elMain = document.querySelector('main'),
    elTitlebar = elMain.querySelector('.titlebar'),
    elSearch = elMain.querySelector('.search'),
    elSpaces = elMain.querySelector('.spaces'),
    elMenu = elMain.querySelector('.b.menu');


const menuSpaces = elMenu.querySelector('.spaces');


const spaces = await $config.getList('space');
const profiles = await $config.getList('profile');
const folders = await $config.getList('folder');
const tabs = await $config.getList('tab');


console.log(profiles, spaces, folders, tabs);

$profiles.insertAll(profiles);
$spaces.insertAll(spaces);
$folders.insertAll(folders);
$tabs.insertAll(tabs);

$spaces.set([...$spaces.list][0][0]);

$ipc.on('tabs:new', (event, tab) => {
    if (!$spaces.current) return;

    const newTab = $tabs.insert(tab);

    $spaces.current.addItem('tab', newTab.id, {
        mode: 'position',
        position: 'start'
    });

    $tabs.setCurrentTab(newTab.id);
});


const [newProfile] = elMain.querySelectorAll('.new');

newProfile.addEventListener('click', async event => {
    console.log('new profile');

    const [e, profile] = await $ipc.send('config:profiles:new', { name: Date.now().toString() });

    console.log(e, profile);
});

function initSpaceForm() {
    const [nameInput, profileIdInput, buttonCreateSpace] = document.querySelectorAll('.space-c');

    let data = {};

    nameInput.addEventListener('input', event => {
        data.name = event.target.value;
    });

    profileIdInput.addEventListener('input', event => {
        data.profileId = event.target.value;
    });

    buttonCreateSpace.addEventListener('click', async () => {
        console.log('new space');

        const [e, space] = await $ipc.send('config:spaces:new', data);

        console.log(e, space);
    })
}

function initFolderForm() {
    const [nameInput, buttonCreate] = document.querySelectorAll('.folder-c');

    let data = {};

    nameInput.addEventListener('input', event => {
        data.name = event.target.value;
    });

    buttonCreate.addEventListener('click', async () => {
        console.log('new folder');

        data.parent = `space:${$spaces.current.id}:0`;

        const [e, folder] = await $ipc.send('config:folders:new', data);

        const f = $folders.insert(folder, true);
        console.log(f, folder);
    })
}

function initTabForm() {
    const [urlInput, buttonCreate] = document.querySelectorAll('.tab-c');

    let data = {};

    urlInput.addEventListener('input', event => {
        data.url = event.target.value;
    });

    buttonCreate.addEventListener('click', async () => {
        console.log('new tab');

        data.name = data.url;
        data.parent = `space:${$spaces.current.id}:0`;

        const [e, tab] = await $ipc.send('config:tabs:new', data);

        $tabs.insert(tab);
    })
}

initSpaceForm();
initFolderForm();
initTabForm();