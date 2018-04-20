import { v4 } from 'uuid';

/**
 * Create new UUID v4 string in uppercase
*/
export function createUUIDString(): string {
    return v4().toUpperCase();
}
