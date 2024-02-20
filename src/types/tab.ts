export interface Tab {
    id: string;
    name: string;
    url: string;
    parent: string; // '<type>:<id>'

    updatedAt: number;
    createdAt: number;
}