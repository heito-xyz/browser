// * Libs
import { $config } from '../../config.js';
import { $tabs } from '../../items/tabs.js';


export function archiveMenuComponent() {
    const container = document.createElement('div');

    container.className = 'archive';

    container.innerHTML = Math.random();

    const list = document.createElement('ul');

    $config.getList('tab', 'archive').then(items => {
        for (const item of items) {
            const tab = document.createElement('li');
            
            tab.innerHTML = `
            <img src="https://www.google.com/s2/favicons?domain=${item.url}">
            <div>
                <div class="name">${item.name}</div>
                <div class="url">${item.url}</div>
            </div>
            `;

            tab.addEventListener('click', () => {
                const newTab = $tabs.insert(item);

                $tabs.setCurrentTab(newTab.id);
            });
    
            list.append(tab);
        }
    });


    container.append(list);

    return container;
}