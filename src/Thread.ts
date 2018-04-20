import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

/**
 * Native thread
 */
export class Thread<T, U> {
    private worker: Worker | undefined = undefined;

    public _subject: Subject<{ success: boolean, data: U }> = new Subject();

    /**
     * Callback of data computed
     */
    public computed: Observable<{ success: boolean, data: U }> = this._subject.asObservable();

    /**
     * Create a thread
     * @param handler Runner. Runner's code will be copied to an isolated worker context.
     */
    public constructor(private handler: (data: T) => U) {
        if (!Worker) {
            console.error('Cannot create thread: Runnign environment does not supports Web worker');
            return;
        }
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
    }

    /**
     * Destroy thread
     */
    public stop(): void {
        if (!this.worker) {
            return;
        }
        this.worker.terminate();
    }

    /**
     * Send a value to thread for compute
     * @param value Target value
     */
    public compute(value: T): void {
        if (!this.worker) {
            return;
        }
        this.worker.postMessage(value);
    }
}
