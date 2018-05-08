import { Observable, Subject } from 'rxjs';

export enum ThreadMode {
    WebWorker,
    Promise,
    SetTimeout
}

/**
 * Native thread
 */
export class Thread<T, U> {
    private worker: Worker | Promise<void> | number;
    private _mode: ThreadMode;
    private _subject: Subject<{ success: boolean, data: U }> = new Subject();
    private _computed: Observable<{ success: boolean, data: U }> = this._subject.asObservable();

    /**
     * Get callback observable of data computed
     */
    public get computed(): Observable<{ success: boolean, data: U }> {
        return this._computed;
    }

    /**
     * Get thread mode
     */
    public get mode(): ThreadMode {
        return this._mode;
    }

    /**
     * Create a thread
     * @param mode Thread working mode
     * @param handler Runner. Runner's code will be copied to an isolated worker context.
     */
    public constructor(private handler: (data: T) => U, mode?: ThreadMode) {
        switch (mode) {
            case undefined:
            case null:
            case ThreadMode.WebWorker:
                if (typeof Worker !== 'undefined') {
                    const blob = new Blob(
                        [`onmessage=function(a){var h=${handler.toString()};postMessage(h(a.data))}`],
                        { type: 'application/javascript' });
                    this.worker = new Worker(URL.createObjectURL(blob));
                    this.worker.onmessage = (event: MessageEvent) => {
                        this._subject.next({ success: true, data: event.data });
                    };
                    this.worker.onerror = (event: ErrorEvent) => {
                        this._subject.next({ success: false, data: event.error });
                    };
                    this._mode = ThreadMode.WebWorker;
                    break;
                } else if (mode === ThreadMode.WebWorker) {
                    throw new TypeError('Cannot create thread: Runnign environment does not support Web worker');
                }
            // tslint:disable-next-line:no-switch-case-fall-through
            case ThreadMode.Promise:
                if (typeof Promise !== 'undefined') {
                    this.worker = new Promise(resolve => { resolve(); });
                    this._mode = ThreadMode.Promise;
                    break;
                } else if (mode === ThreadMode.Promise) {
                    throw new TypeError('Cannot create thread: Runnign environment does not support Promise');
                }
            // tslint:disable-next-line:no-switch-case-fall-through
            case ThreadMode.SetTimeout:
            default:
                this._mode = ThreadMode.SetTimeout;
                this.worker = 0;
                break;
        }
    }

    /**
     * Destroy thread
     * @return Is the thread stopped. Notice that ```Promise``` does not support stop and returned value will always
     * be false if thread is using ```Promise```.
     */
    public stop(): boolean {
        if (this.worker instanceof Worker) {
            this.worker.terminate();
            return true;
        } else if (this.worker instanceof Promise) {
            return false;
        } else {
            clearTimeout(this.worker);
            return true;
        }
    }

    /**
     * Send a value to thread for compute
     * @param value Target value
     */
    public compute(value: T): void {
        if (typeof Worker !== 'undefined' && this.worker instanceof Worker) {
            this.worker.postMessage(value);
        } else if (typeof Promise !== 'undefined' && this.worker instanceof Promise) {
            this.worker = this.worker.then(() => {
                const data = this.handler(value);
                this._subject.next({ success: true, data: data });
            }).catch(error => {
                this._subject.next({ success: false, data: error });
            });
        } else {
            this.worker = setTimeout(() => {
                try {
                    const data = this.handler(value);
                    this._subject.next({ success: true, data: data });
                } catch (ex) {
                    this._subject.next({ success: false, data: ex });
                }
            });
        }
    }
}
