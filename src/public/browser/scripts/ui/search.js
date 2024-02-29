// * UI
import { $sidebar } from './sidebar/index.js';
import { $titlebar } from './sidebar/titlebar.js';

// * Items
import { $spaces } from '../items/spaces.js';
import { $tabs } from '../items/tabs.js';


const regexUrl = /^(?:(?:https?|ftp):\/\/)?(?:[\w-]+\.)+[a-z]{2,}(?::(?!0+(?:$|[^0-9]))([1-9]\d{0,3}|[1-5]\d{4}|6(?:[0-4]\d{3}|5(?:[0-4]\d{2}|5(?:[0-2]\d|3[0-5]))))(?=$|[^0-9]))?|localhost(?::(?!0+(?:$|[^0-9]))([1-9]\d{0,3}|[1-5]\d{4}|6(?:[0-4]\d{3}|5(?:[0-4]\d{2}|5(?:[0-2]\d|3[0-5]))))(?=$|[^0-9]))?|(?:\d{1,3}\.){3}\d{1,3}(?::(?!0+(?:$|[^0-9]))([1-9]\d{0,3}|[1-5]\d{4}|6(?:[0-4]\d{3}|5(?:[0-4]\d{2}|5(?:[0-2]\d|3[0-5]))))(?=$|[^0-9]))?$/;


class Search {
    /**
     * @readonly
     * @type { HTMLElement }
    */
    elAddress = $sidebar.elTabAddress;

    /**
     * @readonly
     * @type { HTMLElement }
    */
    el = document.querySelector('main > .search');

    /**
     * @readonly
     * @type { HTMLInputElement }
    */
    input = this.el.querySelector('.textbox label input[type="text"]');

    /**
     * @private
    */
    _showed = false;

    constructor() {
        this.init();
    }


    show() {
        this.el.style.display = 'flex';
        this._showed = true;

        this.input.focus();
    }

    hide() {
        this.el.style.display = 'none';
        this._showed = false;
        this.input.value = '';
    }

    toggle() {
        this[this._showed ? 'hide' : 'show']();
    }


    updateUrl(url) {
        this.elAddress.querySelector('.url').innerHTML = url;
    }


    /**
     * @private
    */
    initInputEvent() {
        let value = '',
            index = 0,
            list = [],
            timer;

        function setIndex(i) {
            if (i < 0 || i >= list.length) return;

            index = i;

            list.forEach(({ node }, idx) => {
                node.className = idx === i ? 'active' : '';
            });
        }

        this.input.addEventListener('keydown', event => {
            if (event.keyCode === 13) { // Enter
                const { url, goTo } = list[index];

                if (goTo) {
                    $tabs.setCurrentTab(goTo);
                } else if (url) {
                    $spaces.current.newTab(list[index].url);
                }

                this.hide();
            } else if (event.keyCode === 38) { // Up
                setIndex(index - 1);
            } else if (event.keyCode === 40) { // Down
                setIndex(index + 1);
            }
        });

        this.input.addEventListener('input', event => {
            value = event.target.value;

            clearTimeout(timer);

            if (value.trim() === '') return;

            timer = setTimeout(() => {
                const ul = this.el.querySelector('ul');
            
                ul.innerHTML = '';
                list = [];
                index = 0;

                if (regexUrl.test(value)) {
                    const hasHttp = /(http(s?)):\/\//i.test(value);

                    let item = {
                        name: `Open in new tab - ${value}`,
                        url: value,
                        icon: 'icon|link',
                        node: null
                    };

                    if (!hasHttp) {
                        item.url = `http${item.url.slice(0, 9) === 'localhost' ? '' : 's'}://${item.url}`;
                    }

                    list.push(item);
                }

                list.push({
                    name: `Open in search - ${value}`,
                    icon: 'image|https://www.google.com/s2/favicons?domain=ya.ru',
                    url: `https://ya.ru/search/?text=${value}`,
                    node: null
                });


                $tabs.list.forEach(tab => {
                    if (tab.name.includes(value) || tab.url.href.includes(value)) {
                        list.push({
                            name: `Switch to -> ${tab.name}`,
                            icon: `image|${tab.image}`,
                            goTo: tab.id,
                            node: null
                        });
                    }
                });


                for (let i = 0; i < list.length; i++) {
                    const { name, icon, url } = list[i];

                    list[i].node = document.createElement('li');

                    if (i === 0) list[i].node.className = 'active';

                    const [type, iconName] = icon.split('|');

                    list[i].node.innerHTML = `
                    ${type === 'icon' ? `<i class="ib-${iconName}"></i>` : `<img src="${iconName}">`}
                    <span>${name}</span>
                    `;

                    ul.appendChild(list[i].node);
                }
            }, 100);
        });
    }


    /**
     * @private
    */
    init() {
        this.initInputEvent();

        window.addEventListener('keydown', event => {
            if (event.ctrlKey && event.keyCode === 84) {
                this.show();
            }

            if (this._showed && event.keyCode === 27) {
                this.hide();
            }
        });

        this.el.addEventListener('click', event => {
            if (event.target.contains(this.el)) {
                this.hide();
            }
        });
    }
}

export const $search = new Search();