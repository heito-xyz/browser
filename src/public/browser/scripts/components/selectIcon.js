// * Components
import { navBarComponent } from './navBar.js';

export const listIcons = [
    'activity',
    'alert-circle',
    'alert-octagon',
    'alert-triangle',
    'align-center',
    'align-justify',
    'align-left',
    'align-right',
    'archive',
    'at-sign',
    'bell',
    'bell-off',
    'bluetooth',
    'book',
    'book-open',
    'box',
    'calendar',
    'camera',
    'camera-off',
    'cast',
    'check',
    'chevron-down',
    'chevron-left',
    'chevron-right',
    'chevron-up',
    'chevrons-down',
    'chevrons-left',
    'chevrons-right',
    'chevrons-up',
    'clipboard',
    'codesandbox',
    'coffee',
    'columns',
    'command',
    'copy',
    'crop',
    'dollar-sign',
    'download',
    'droplet',
    'edit',
    'edit-2',
    'edit-3',
    'external-link',
    'eye',
    'eye-off',
    'file',
    'file-minus',
    'file-plus',
    'file-text',
    'filter',
    'gift',
    'grid',
    'hash',
    'headphones',
    'heart',
    'help-circle',
    'image',
    'info',
    'italic',
    'key',
    'layers',
    'layout',
    'link',
    'link-2',
    'lock',
    'mail',
    'map',
    'map-pin',
    'maximize',
    'minimize',
    'minus',
    'minus-circle',
    'monitor',
    'moon',
    'more-horizontal',
    'more-vertical',
    'move',
    'music',
    'package',
    'paperclip',
    'plus',
    'plus-circle',
    'printer',
    'rotate-cw',
    'scissors',
    'search1',
    'share-2',
    'shield',
    'sidebar',
    'slash',
    'star',
    'sun',
    'terminal',
    'trash',
    'tv',
    'type',
    'umbrella',
    'underline',
    'unlock',
    'video',
    'video-off',
    'volume',
    'volume-1',
    'volume-2',
    'volume-x',
    'wifi',
    'wifi-off',
    'x',
    'x-circle',
    'youtube',
    'zap',
    'zap-off',
    'zoom-in',
    'zoom-out',
    'stars',
    'settings',
    'folder-solid',
    'folder-outline',
    'show-sidebar',
    'translate'
];


function iconPickerComponent(select) {
    const container = document.createElement('div');

    container.className = 'icon-picker';

    const list = document.createElement('ul');

    for (const icon of listIcons) {
        const el = document.createElement('li');

        el.innerHTML = `<i class="ib-${icon}"></i>`;

        el.addEventListener('click', () => {
            select(icon);
        });

        list.appendChild(el);
    }

    container.appendChild(list);

    return container;
}

function emojiPickerComponent() {
    const container = document.createElement('div');

    container.className = 'emoji-picker';

    container.innerHTML = 'emoji';

    return container;
}

function imageSelectComponent(select) {
    const container = document.createElement('div');

    container.className = 'image-select';

    const input = document.createElement('input');

    input.type = 'file';
    input.accept = `image/png, image/gif, image/jpeg`;

    input.addEventListener('input', () => {
        if (input.files.length < 1) return;

        select(input.files[0]);
    });

    container.appendChild(input);

    return container;
}



export function selectIconComponent(select) {
    const container = document.createElement('div');

    container.className = 'component-select-icon';

    const iconPicker = iconPickerComponent(icon => {
        select({
            type: 'icon',
            value: icon
        });
    });
    const emojiPicker = emojiPickerComponent();
    const imageSelect = imageSelectComponent(file => {
        select({
            type: 'image',
            value: file.path
        })
    });

    iconPicker.style.display = 'block';
    emojiPicker.style.display = 'none';
    imageSelect.style.display = 'none';

    const navBar = navBarComponent([
        {
            label: 'Icon',
            value: 'icon'
        },
        {
            label: 'Emoji',
            value: 'emoji'
        },
        {
            label: 'Image',
            value: 'image'
        }
    ], {
        default: 'icon'
    }, item => {
        iconPicker.style.display = item.value === 'icon' ? 'block' : 'none';
        emojiPicker.style.display = item.value === 'emoji' ? 'block' : 'none';
        imageSelect.style.display = item.value === 'image' ? 'block' : 'none';
    });

    container.append(navBar, iconPicker, emojiPicker, imageSelect);

    return container;
}