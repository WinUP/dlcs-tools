/**
 * Return call stack
*/
export function callStack(): CallStackItem[] {
    const stackInfo = new Error().stack;
    const tester = /at (\S+) \((.+):(\d+):(\d+)\)/g;
    if (stackInfo === undefined || stackInfo.length < 3) {
        return [];
    }
    return stackInfo.split('\n').slice(2).map((v: string): CallStackItem | null => {
        const source = tester.exec(v.trim());
        if (source == null) {
            return null;
        }
        return {
            identifiers: source[1].split('.'),
            fileName: source[2],
            line: +source[3],
            position: +source[4]
        };
    }).filter<CallStackItem>((v: CallStackItem | null): v is CallStackItem => v != null);
}

/**
 * Call stack information
*/
export interface CallStackItem {
    /**
     * Identifiers
    */
    identifiers: string[];
    /**
     * Source file name
    */
    fileName: string;
    /**
     * Line in file
    */
    line: number;
    /**
     * Position in line
    */
    position: number;
}
