/**
 * Indicate if target is not null, undefined, or empty string
 * @param data Target data
 */
export function isValueAvailable<T = any>(data: T): data is NonNullable<T> {
    return data != null && (typeof data === 'string' && data !== '');
}
