/**
 * Indicate if target is not null, undefined, or empty string
 * @param data Target data
 */
export function isValueAvailable(data: any): data is NonNullable<any> {
    return data != null && data !== '';
}
