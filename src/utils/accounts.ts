import { app } from 'electron';
import fs from 'fs';

// * Utils
import { uuidv4 } from './uuid';

// * Types
import type { TypeItem, TypeParent, FileAccounts } from '../types';
import type { Profile } from '../types/profile';
import type { Space } from '../types/space';
import type { Folder } from '../types/folder';
import type { Tab } from '../types/tab';


class Account {
    readonly name;
    readonly folder;

    profiles = new Map<string, Profile>();
    spaces = new Map<string, Space>();
    folders = new Map<string, Folder>();
    tabs = new Map<string, Tab>();

    private _currentSpaceId: string | null = null;

    constructor(name: string) {
        this.name = name;
        this.folder = app.getPath('userData') + `/accounts/${this.name}`;

        this.parseItem('profile');
        this.parseItem('space');
        this.parseItem('folder');
        this.parseItem('tab');
    }


    get currentSpace() {
        if (!this._currentSpaceId) return null;

        return this.spaces.get(this._currentSpaceId);
    }


    public checkAccountFolder() {
        if (!fs.existsSync(this.folder)) {
            fs.mkdirSync(this.folder);
        }

        return true;
    }

    public getConfigData<Type = any>(fileName: string, defaultData: any = []): Type | null {
        try {
            if (!this.checkAccountFolder()) return null;
    
            const filePath = `${this.folder}/${fileName}.json`;
    
            if (!fs.existsSync(filePath)) {
                fs.writeFileSync(filePath, JSON.stringify(defaultData), { encoding: 'utf-8' });
            }
    
            const data = fs.readFileSync(filePath, { encoding: 'utf-8' });
        
            return JSON.parse(data) as Type;
        } catch (error) {
            console.log(error);
            
            return defaultData;
        }
    }

    public setConfigData(fileName: string, data: any) {
        try {
            if (!this.checkAccountFolder()) return null;
    
            fs.writeFileSync(`${this.folder}/${fileName}.json`, JSON.stringify(data), { encoding: 'utf-8' });
        
            return true;
        } catch (error) {
            console.log(error);
            
            return false;
        }
    }

    private saveConfig<TypeValue, TypeKey = string>(name: string, map: Map<TypeKey, TypeValue>): boolean {
        const list: Array<TypeValue> = [];

        map.forEach((value, key) => {
            list.push(value);
        });

        const result = this.setConfigData(name, list);

        return Boolean(result);
    }


    // * Save
    public save<Type = any>(type: TypeItem) {
        const name = type + 's';

        // @ts-ignore
        return this.saveConfig<Type>(name, this[name]);
    }


    // * Create new
    private newItem<Type = any>(type: TypeItem, body: Type & { name: string }) {
        const date = Date.now();

        // @ts-ignore
        if (body?.id) delete body['id'];

        const newItem: any = {
            id: uuidv4(),
            ...body,
            updatedAt: date,
            createdAt: date
        }

        const name = type + 's';

        // @ts-ignore
        this[name].set(newItem.id, newItem);

        this.save(type);

        return newItem;
    }

    public newProfile(name: string, icon: string = '') {
        return this.newItem<Pick<Profile, 'icon'>>('profile', {
            name,
            icon
        });
    }

    public newSpace(name: string, icon: string = '', profileId: string = 'global') {
        return this.newItem<Omit<Space, 'id' | 'updatedAt' | 'createdAt'>>('space', {
            name,
            icon,
            profileId,
            background: '',
            items: [],
        });
    }

    public newFolder(name: string, icon: string = '', parent: TypeParent) {
        return this.newItem<Omit<Folder, 'id' | 'updatedAt' | 'createdAt'>>('folder', {
            name,
            icon,
            parent: parent.join(':'),
            items: [],
        });
    }

    public newTab(name: string, url: string, parent: TypeParent) {
        return this.newItem<Omit<Tab, 'id' | 'updatedAt' | 'createdAt'>>('tab', {
            name,
            url,
            parent: parent.join(':'),
        });
    }


    // * Update
    public updateItem<Type = { id: string, name: string, updatedAt: number, createdAt: number }>(type: TypeItem, id: string, body: any) {
        const item = this[`${type}s`]?.get(id) as Type;
        
        if (!item) return false;
        
        for (const key in body) {
            // @ts-ignore
            item[key] = body[key];
        }

        // @ts-ignore
        item.updatedAt = Date.now();

        this.save(type);

        return item;
    }


    // * Parse
    private parseObject<Type>(list: Array<Type & { id: string }>, map: Map<string, Type>) {
        for (const item of list) {
            map.set(item.id, item);
        }
    }

    private parseItem<Type>(type: TypeItem) {
        const name = type + 's';

        const list = this.getConfigData<Array<Type>>(name, []);

        if (!list) return;

        if (type === 'space' && list[0]) {
            this._currentSpaceId = (list[0] as any as Space).id;
        }

        // @ts-ignore
        this.parseObject<Type>(list, this[name]);
    }
}

class Accounts {
    readonly appFolder = app.getPath('userData');
    readonly accountsFolder = this.appFolder + '/accounts';

    private list = new Map<string, Account>();

    private currentName: string = '';


    constructor() {
        this.checkAccountsFolder();

        this.fileToMap();
    }


    get current() {
        return this.list.get(this.currentName);
    }


    public checkAccountsFolder() {
        if (!fs.existsSync(this.accountsFolder)) {
            fs.mkdirSync(this.accountsFolder);
        }
    }

    
    set(name: string) {
        this.currentName = name;
    }
    
    create(name: string) {
        const account = new Account(name);

        this.list.set(name, account);

        return account;
    }


    fileToMap() {
        try {
            const file = fs.readFileSync(this.accountsFolder + '/accounts.json', { encoding: 'utf-8' });

            const data = JSON.parse(file) as FileAccounts;

            for (const name in data.accounts) {
                this.create(name);
            }
            
            if (data.current) this.currentName = data.current;

            return true;
        } catch (error) {
            console.log(error);
            
            return false;
        }
    }

    saveToFile() {
        try {
            this.checkAccountsFolder();

            const data: FileAccounts = {
                current: this.currentName || null,
                accounts: {}
            };

            this.list.forEach(account => {
                console.log(account);
                
                data.accounts[account.name] = {
                    createdAt: Date.now()
                };
            });

            fs.writeFileSync(this.accountsFolder + '/accounts.json', JSON.stringify(data), { encoding: 'utf-8' });

            return true;
        } catch (error) {
            console.log(error);
            
            return false;
        }
    }
}

export const $accounts = new Accounts();