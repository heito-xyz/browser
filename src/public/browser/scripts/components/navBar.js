/**
 * @typedef Item
 * 
 * @property { String } label
 * @property { * } value
*/

/**
 * @typedef Options
 * 
 * @property { String } default
*/

/**
 * @callback NavBarSelectedItem
 * 
 * @param { Item } item 
*/

/**
 * @param { Array<Item> } items 
 * @param { Options } options 
 * @param { NavBarSelectedItem } select 
*/
export function navBarComponent(items, options, select) {
    const container = document.createElement('div');

    container.className = 'nav-bar';
    
    const list = document.createElement('ul');

    for (const item of items) {
        const li = document.createElement('li');

        li.innerHTML = item.label;

        if (item.value === options.default) li.classList.add('active');

        li.addEventListener('click', () => {
            list.querySelector('li.active').classList.remove('active');

            li.classList.add('active');

            select(item);
        });

        list.appendChild(li);
    }

    container.appendChild(list);

    return container;
}