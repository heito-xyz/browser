// * Libs
import { $ipc } from '../../ipc.js';

// * Items
import { $profiles } from '../../items/profiles.js';


class PageSettings {
    /**
     * @type { HTMLElement }
    */
    page;

    constructor() {
        this.init();
    }

    /**
     * @private
    */
    newProfileForm() {
        const form = document.createElement('div');

        const listProfiles = document.createElement('ul');

        const addProfile = profile => {
            const li = document.createElement('li');

            li.innerHTML = `<span>${profile.name}</span><i class="ib-x"></i>`

            li.querySelector('i').onclick = () => {
                $profiles.list.delete(profile.id);

                li.remove();
            }

            listProfiles.appendChild(li);
        }

        $profiles.list.forEach(profile => {
            addProfile(profile);
        });

        const input = document.createElement('input');

        input.type = 'text';
        input.placeholder = 'Profile name'

        const btn = document.createElement('button');

        btn.textContent = 'New Profile'

        btn.onclick = async () => {
            if (!input.value) return;

            const [e, profile] = await $ipc.send('config:profiles:new', { name: input.value });

            console.log('New profile:', profile);

            $profiles.insert(profile);
        }

        form.append(input, btn, listProfiles);

        return form;
    }

    /**
     * @private
    */
    init() {
        this.page = document.createElement('div');

        this.page.className = 'page settings';

        this.page.innerHTML = 'Settings';

        this.page.appendChild(this.newProfileForm());
    }
}

export const pageSettings = new PageSettings();