import pako from 'pako-es'

export default async data => {
    try {
        const parsedData = data.replace(/-/gim, '+').replace(/_/gim, '/')

        const decoded = atob(parsedData)
        const charData = decoded.split('').map(i => i.charCodeAt(0));
        const binData = new Uint8Array(charData);

        // Pako magic
        return pako.inflate(binData, { to: 'string' });
    } catch (err) {
        console.log(err)
    }
    return false
}
