import path from 'path';


export const isDev = process.env.NODE_ENV === 'dev';

export const rootPath = path.join(__dirname, '../../', isDev ? 'src' : 'build');


export function join(...paths: Array<string>) {
    return path.join(rootPath, ...paths);
}