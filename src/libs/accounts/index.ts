import { app } from 'electron';
import fs from 'fs';

// * Libs
import { Account } from './account';

// * Types
import type { FileAccounts } from '../../types';


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