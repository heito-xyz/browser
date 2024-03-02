import { $ipc } from './ipc.js';


class Config {
    /**
     * @param { 'profile' | 'space' | 'folder' | 'tab' } type
     * @param { 'all' | 'archive' | 'delete' } items
     */
    getList(type, items = 'all') {
        return $ipc.invoke('configs:items', { type, items });
    }

    /**
     * @param { 'profile' | 'space' | 'folder' | 'tab' } type
     * @param { String } id
     * @param { any } body
    */
    updateItem(type, id, body) {
        return $ipc.invoke('configs:items:update', {
            type, id, body
        });
    }


    /**
     * @param { 'profile' | 'space' | 'folder' | 'tab' } type
     * @param { String } id
     * @param { 'archive' | 'delete' } action
    */
    removeItem(type, id, action = 'archive') {
        return $ipc.invoke('configs:items:remove', {
            type, id, action
        });
    }
}

export const $config = new Config();