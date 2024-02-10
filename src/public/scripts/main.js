import { $titlebar } from './titlebar.js';
import { $spaces } from './spaces.js';
import { $pages } from './pages.js';
import { $folders } from './folders.js';

const { ipcRenderer } = require('electron');

ipcRenderer.send('test', 123)

// * Elements
const
    elMain = document.querySelector('main'),
    elTitlebar = elMain.querySelector('.titlebar'),
    elSearch = elMain.querySelector('.search'),
    elSpaces = elMain.querySelector('.spaces'),
    elMenu = elMain.querySelector('.menu');


const menuSpaces = document.querySelector('main .panel .menu .spaces');


const spaces = [
    {
        name: 'Main',
        icon: 'ib-settings',
        views: []
    },
    {
        name: 'Dev',
        icon: 'ib-minus',
        views: [
            {
                type: 'page',
                url: 'https://ya.ru'
            },
            {
                type: 'folder',
                name: 'HTML',
                pages: [
                    {
                        url: 'https://arc.net'
                    },
                    {
                        url: 'https://discord.com'
                    },
                    {
                        url: 'https://miro.com'
                    },
                    {
                        url: 'https://heito.xyz'
                    }
                ]
            }
        ]
    },
    {
        name: 'Test',
        icon: 'ib-settings',
        views: []
    },
    {
        name: 'Main',
        icon: 'ib-settings',
        views: []
    },
    {
        name: 'Main',
        icon: 'ib-settings',
        views: []
    },
    {
        name: 'Main',
        icon: 'ib-settings',
        views: []
    },
    {
        name: 'Main',
        icon: 'ib-settings',
        views: []
    },
    {
        name: 'Main',
        icon: 'ib-settings',
        views: []
    },
    {
        name: 'Main',
        icon: 'ib-settings',
        views: []
    },
];


for (const { name, icon, views } of spaces) {
    const space = $spaces.create(icon, name);

    for (const view of views.sort((a, b) => a.name === 'folder' ? 1 : -1)) {
        console.log(view);
        if (view.type === 'folder') {
            const folder = $folders.create(view.name);

            for (const { url } of view.pages) {
                const page = $pages.create(url);

                folder.addPage(page);
            }

            space.addFolder(folder);
        } else if (view.type === 'page') {
            const page = $pages.create(view.url);

            space.addPage(page);
        }
    }

    const spaceBtn = document.createElement('li');

    spaceBtn.onclick = () => {
        if (spaceBtn.classList.contains('acitve')) return;

        const listSpaces = menuSpaces.querySelectorAll('li');

        listSpaces.forEach(space => {
            space.classList.remove('active');
        });

        spaceBtn.classList.add('active');
        
        $spaces.set(space.id);
    }

    menuSpaces.appendChild(spaceBtn);
}

$spaces.set(1);


ipcRenderer.on('tabs:new', (event, details) => {
    if (!$spaces.current) return;

    const newPage = $pages.create(details.url);

    $spaces.current.addPage(newPage, 'afterend');

    newPage.open();
})