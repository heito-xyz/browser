class Profile {
    /**
     * @param { String } name
     * 
     * @param { Object } profile 
     * @param { String } profile.id
     * @param { String } profile.name
     * @param { String } profile.icon
     * @param { Number } profile.createdAt
    */
    constructor(name, profile = null) {
        /** @readonly */
        this.name = name;

        if (profile) {
            this.id = profile.id;
            this.name = profile.name;
            this.icon = profile.icon;
            this.createdAt = profile.createdAt;
        }


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
        this.create('global');
    }
    
    
    /**
     * @param { String } name
    */
    create(name) {
        const profile = new Profile(name);

        this.list.set(profile.name, profile);

        return profile;
    }


    /**
     * @param { Array.<{
     * id: string;
     * name: string;
     * icon: string;
     * createdAt: number;
     * }> } profiles
    */
    insertAll(profiles) {
        for (const profile of profiles) {
            const newProfile = new Profile(profile.name, profile);

            this.list.set(profile.id, newProfile);
        }
    }
}

export const $profiles = new Profiles();