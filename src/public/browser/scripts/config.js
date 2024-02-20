import { $ipc } from './ipc.js';


class Config {
    /**
     * @param { 'profile' | 'space' | 'folder' | 'tab' } type
     * @param { 'all' | 'archive' | 'delete' } items
     */
    getList(type, items = 'all') {
        return new Promise(res => {
            $ipc.send('config:items', { type, items }).then(([event, list]) => {
                res(list);
            });
        });
    }

    /**
     * @param { 'profile' | 'space' | 'folder' | 'tab' } type
     * @param { String } id
     * @param { any } body
    */
    updateItem(type, id, body) {
        return new Promise(res => {
            $ipc.send('config:items:update', {
                type,
                id,
                body
            }).then(([event, item]) => {
                res(item);
            });
        });
    }


    /**
     * @param { 'profile' | 'space' | 'folder' | 'tab' } type
     * @param { String } id
     * @param { 'archive' | 'delete' } action
    */
    removeItem(type, id, action = 'archive') {
        return new Promise(res => {
            $ipc.send('config:items:remove', {
                type,
                id,
                action
            }).then(([event, item]) => {
                res(item);
            });
        });
    }
}

export const $config = new Config();