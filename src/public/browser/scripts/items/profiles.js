/**
 * @typedef ItemProfile
 * 
 * @property { String } id
 * @property { String } name
 * @property { String } icon
 * @property { Number } createdAt
*/

class Profile {
    /**
     * @param { ItemProfile } profile
    */
    constructor(profile) {
        /** @readonly */
        this.id = profile.id;
        /** @readonly */
        this.name = profile.name;
        /** @readonly */
        this.icon = profile.icon;
        /** @readonly */
        this.createdAt = profile.createdAt;


        /** @readonly */
        this.cacheName = btoa(this.name);
    }
}

class Profiles {
    /**
     * @readonly
     * @type { Map<String, Profile> }
    */
    list = new Map();


    constructor() {
        this.insert({
            id: 'global',
            name: 'global',
            icon: 'stars',
            createdAt: 0
        });
    }


    /**
     * @param { ItemProfile } profile
    */
    insert(profile) {
        const newProfile = new Profile(profile);

        this.list.set(profile.id, newProfile);

        return newProfile;
    }


    /**
     * @param { Array<ItemProfile> } profiles
    */
    insertAll(profiles) {
        for (const profile of profiles) {
            this.insert(profile);
        }
    }
}

export const $profiles = new Profiles();