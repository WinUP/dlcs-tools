import * as UA from 'ua-device';

/**
 * Version code
 */
export interface VersionCode {
    /**
     * Product name
     */
    name: string;
    /**
     * Product version
     */
    version: {
        /**
         * Main version
         */
        original: string;
        /**
         * Detail version
         */
        detail?: string;
        /**
         * Alias
         */
        alias?: string;
    };
}

/**
 * Running context environment information
 */
export interface ContextEnvironment {
    /**
     * Browser information
     */
    browser: VersionCode & {
        /**
         * Browser mode
         */
        mode: 'desktop' | 'proxy' | 'compat' | '';
    };
    /**
     * Browser engine
     */
    engine: VersionCode;
    /**
     * Opeartion system
     */
    os: VersionCode;
    /**
     * Device
     */
    device: ContectDeviceInformation;
}

/**
 * Device information
 */
export interface ContectDeviceInformation {
    /**
     * Device type
     */
    type: 'emulator' | 'mobile' | 'desktop' | 'tablet' | 'television' | 'ereader' | 'gaming' | 'media' | 'server' | '';
    /**
     * Manufacturer
     */
    manufacturer: string;
    /**
     * Model
     */
    model: string;
}

/**
 * Get running context environment information
 */
export function environment(): ContextEnvironment {
    return context;
}

let context: ContextEnvironment;
if (typeof navigator !== 'undefined') {
    context = new UA(navigator.userAgent);
    let match: RegExpExecArray | null;
    if (match = /Edge\/([\w.]+)/i.exec(navigator.userAgent)) {
        context.browser.name = 'Microsoft Edge';
        context.browser.version.original = match[1];
    }
} else {
    const os = require('os');
    context = {
        browser: {
            name: 'NodeJS',
            version: { original: process.versions.node },
            mode: ''
        },
        engine: {
            name: 'V8',
            version: { original: process.versions.v8 }
        },
        os: {
            name: os.type(),
            version: { original: os.release() }
        },
        device: {
            type: 'server',
            manufacturer: 'nodejs',
            model: 'nodejs'
        }
    };
}
