export type TypeItem = 'folder' | 'tab';

export interface Item {
    type: TypeItem;
    id: number;
}

export interface Folder {
    id: string;
    name: string;
    icon: string;
    parent: string; // '<type>:<id>'

    items: Array<Item>;

    updatedAt: number;
    createdAt: number;
}