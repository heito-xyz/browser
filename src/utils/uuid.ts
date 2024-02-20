import crypto from 'crypto';


export function uuidv4(format: string = '10000000-1000-4000-8000-100000000000') {
    return format.replace(/[018]/g, c => {
        const _c = Number(c);

        return (_c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> _c / 4).toString(16)
    });
}