/**
 * Instant debug tool manager
 * @description Instant debug tool manager will add a property called "InstantDebug" in window, use console to access it.
 */
export class InstantDebugger {
    /**
     * Register an instant debug tool
     * @param name Tool's name
     * @param content Delagator
     */
    public static register(name: string, content: any): void {
        (window as any).InstantDebug = (window as any).InstantDebug || {};
        (window as any).InstantDebug[name] = content;
    }

    /**
     * Remove an instant debug tool
     * @param name Tool's name
     */
    public static remove(name: string): void {
        (window as any).InstantDebug = (window as any).InstantDebug || {};
        (window as any).InstantDebug[name] = undefined;
    }
}
