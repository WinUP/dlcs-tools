export function autoname(source: { [key: string]: any }, splitter: string = '/', rename?: (input: string) => string): void {
    _autoname(source, splitter, '', rename);
}

function _autoname(source: { [key: string]: any }, splitter: string = '/', prefix?: string, rename?: (input: string) => string): void {
    Object.keys(source).forEach(key => {
        if (source[key] instanceof Array) {
            return;
        } else if (source[key] instanceof Object) {
            _autoname(source[key], splitter, `${prefix}/${key}`, rename);
        } else {
            source[key] = `${prefix}/${rename ? rename(key) : key}`;
        }
    });
}

export function toCamelCase(input: string): string {
    return input
        .replace(/(?:^\w|[A-Z]|\b\w)/g, (item, index) => index > 0 ? item.toUpperCase() : item.toLowerCase())
        .replace(/\s+/g, '');
}

export function toPascalCase(input: string): string {
    return input
        .replace(/(?:^\w|\b\w)/g, item => item.toUpperCase())
        .replace(/\s+/g, '');
}

export function toSnakeCase(input: string): string {
    return input
        .replace(/(?:^\w|[A-Z]|\b\w|\b\d)/g, (item, index) => index > 0 ? `_${item.toLowerCase()}` : item.toLowerCase())
        .replace(/(?:[A-Za-z]\d)/g, item => `${item[0]}_${item[1]}`)
        .replace(/\s+/g, '');
}
