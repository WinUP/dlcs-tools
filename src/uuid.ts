import { v4 } from 'uuid';

/**
 * Create new UUID v4 string in uppercase
*/
export function uuid(): string {
    return v4().toUpperCase();
}
