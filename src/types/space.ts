import type { Item } from './folder';


export interface Space {
    id: string;
    name: string;
    icon: string;
    profileId: string;
    background: string;

    items: Array<Item>;

    updatedAt: number;
    createdAt: number;
}