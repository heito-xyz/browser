export type TypeItem = 'profile' | 'space' | 'folder' | 'tab';

export type TypeParent = ['space' | 'folder', string, ...Array<string>];

export interface FileAccount {
    createdAt: number;
}

export interface FileAccounts {
    current: string | null;
    accounts: Record<string, FileAccount>;
}
