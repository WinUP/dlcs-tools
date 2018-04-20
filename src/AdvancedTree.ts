import { CancelledEventArgs } from './CancelledEventArgs';
import { createUUIDString } from './createUUIDString';

/**
 * Node status of tree with weight values
 */
export enum AdvancedTreeNodeStatus {
    /**
     * Unavailable
     */
    Unavailable      = 0B0000,
    /**
     * Working
     */
    Working          = 0B0001,
    /**
     * Removing
     */
    Removing         = 0B0010,
    /**
     * Changing priority
     */
    ChangingPriority = 0B0100,
    /**
     * Changing parent
     */
    ChangingParent   = 0B1000
}

/**
 * Node of tree with weight values
 */
export class AdvancedTree<T> {
    /**
     * Get or set parent
     */
    public get parent(): AdvancedTree<T> | null {
        return this._parent;
    } public set parent(value: AdvancedTree<T> | null) {
        this.setParent(value);
    }
    private _parent: AdvancedTree<T> | null = null;

    /**
     * Get status
     */
    public get status(): number {
        return this._status;
    }
    private _status: number = AdvancedTreeNodeStatus.Unavailable;

    /**
     * Get or set weight value
     * @description If more than one nodes have same value, they will follow LIFO
     */
    public get priority(): number {
        return this._priority;
    } public set priority(value: number) {
        this.setPriority(value);
    }
    private _priority: number = 0;

    /**
     * Get next node of same level
     */
    public get next(): AdvancedTree<T> | null {
        return this._next;
    }
    private _next: AdvancedTree<T> | null = null;

    /**
     * Get previous node of same level
     */
    public get previous(): AdvancedTree<T> | null {
        return this._previous;
    }
    private _previous: AdvancedTree<T> | null = null;

    /**
     * Get ID
     */
    public get id(): string {
        return this._id;
    }
    private _id: string;

    private children: Array<AdvancedTree<T>> = new Array<AdvancedTree<T>>();

    /**
     * Get or set enabled
     */
    public enabled: boolean = true;

    /**
     * Get or set content
     */
    public content: T | undefined = undefined;

    public constructor(content?: T | null, id?: string) {
        this.content = content || this.content;
        this._id = id || createUUIDString();
    }

    /**
     * Delete this node with all its children
     */
    public destroy(): void {
        this._status |= AdvancedTreeNodeStatus.Removing;
        this.children.forEach(node => node.destroy());
        this.setParent(null);
        this._status = AdvancedTreeNodeStatus.Unavailable;
    }

    /**
     * Map the tree from this node
     * @param mapper Mapper for each node
     * @param initialData Initial data
     */
    public map<U>(mapper: (node: AdvancedTree<T>, result: U, feedback: CancelledEventArgs) => U, initialData: U): U {
        // ! 带权带开关深度优先非递归遍历 [DFS for tree with switch and priority without recursion] [O(n)]
        let result: U = initialData;
        const walkStack: Array<AdvancedTree<T>> = new Array<AdvancedTree<T>>();
        let listPointer: AdvancedTree<T> = this; // 将指针指向当前节点
        walkStack.push(listPointer); // 放入当前节点
        const feedback: CancelledEventArgs = { cancelled: false }; // 声明强制中断变量
        while (walkStack.length > 0) { // 只要栈内有值便继续处理
            result = mapper(listPointer, result, feedback); // 处理指针指向的节点
            if (feedback.cancelled) { // 如果处理函数要求强制中断，则立即中断遍历
                return result;
            }
            // 以下部分均是为了找到下一个需要处理的节点
            if (listPointer.children.length > 0) { // 优先处理节点的子节点
                walkStack.push(listPointer); // 放入当前节点
                listPointer = listPointer.children[0]; // 从第一个节点开始处理
                while (!listPointer.enabled) { // 跳过所有无效节点
                    while (!listPointer.next) { // 如果当前节点组已经处理完，则返回父节点所在的节点组
                        while (walkStack.length > 0) {
                            // tslint:disable-next-line:no-non-null-assertion
                            listPointer = walkStack.pop()!;
                            if (!listPointer.next) { // 循环直到找到有下一个兄弟节点的节点
                                continue;
                            }
                            break; // 一旦找到，直接跳出循环
                        }
                        if (walkStack.length === 0) { // 如果已经向上回溯到根节点则直接返回结果
                            return result;
                        }
                    }
                    listPointer = listPointer.next; // 移动到下一个节点
                }
                continue; // 命中有效节点时进入下一次主循环，准备处理目标节点
            }
            if (listPointer.next) { // 没有子节点时，处理下一个兄弟节点
                listPointer = listPointer.next; // 处理指针指向兄弟节点
                while (!listPointer.enabled) { // 跳过所有无效的兄弟节点
                    if (!listPointer.next) { // 扫描到最后一个节点且该节点仍然无效（由循环定义）时跳出循环
                        break;
                    }
                    listPointer = listPointer.next;
                }
                if (listPointer.enabled) { // 只要该节点有效，那么进入下一次主循环，准备处理目标节点
                    continue;
                }
            }
            while (walkStack.length > 0) { // 没有下一个兄弟节点时，返回父节点
                // tslint:disable-next-line:no-non-null-assertion
                listPointer = walkStack.pop()!; // 处理指针指向父节点
                if (!listPointer.next) { // 如果该节点是节点组的最后一个，继续返回上一层
                    continue;
                }
                while (listPointer.next) { // 处理该节点的下一个兄弟节点
                    listPointer = listPointer.next; // 处理指针指向兄弟节点
                    if (listPointer.enabled) { // 一旦定位到有效节点，立即跳出循环
                        break;
                    }
                }
                if (listPointer.enabled) { // 只要该节点可用，进入下一次主循环，准备处理目标节点
                    break;
                }
            }
            if (walkStack.length === 0) { // 如果已经向上回溯到根节点则直接返回结果
                return result;
            }
        }
        return result; // 返回最终结果
    }

    /**
     * Print struccture starts from this node
     * @param indent Initial indent
     */
    public printStructure(indent: number = 0): void {
        let title: string = '';
        title += this.children.length > 0 ? '- ' : '  ';
        title += `${this._id} ENABLED: ${this.enabled}, PRIORITY: ${this._priority}, CHILDREN: ${this.children.length}`;
        for (let i = 0; i < indent; i++) {
            title = ' ' + title;
        }
        console.log(title);
        this.children.forEach(e => e.printStructure(indent + 2));
    }

    private setPriority(value: number): void {
        this._status |= AdvancedTreeNodeStatus.ChangingPriority;
        this._priority = value;
        if (this._parent != null) {
            this.setParent(this.parent);
        }
        this._status &= ~AdvancedTreeNodeStatus.ChangingPriority;
    }

    private setParent(parent: AdvancedTree<T> | null): void {
        this._status |= AdvancedTreeNodeStatus.ChangingParent;
        if (this._parent != null) {
            const index = this._parent.children.findIndex(v => v === this);
            this._parent.children.splice(index, 1);
            if (this._previous) {
                this._previous._next = this._next;
            }
            if (this._next) {
                this._next._previous = this._previous;
            }
            this._next = null;
            this._previous = null;
        }
        this._parent = parent;
        if (this._parent == null) {
        } else if (this._parent.children.length === 0) {
            this._parent.children.push(this);
        } else {
            for (let i = 0; i < this._parent.children.length; i++) {
                if (this._priority >= this._parent.children[i]._priority) {
                    this._parent.children.splice(i, 0, this);
                    this._next = this._parent.children[i + 1];
                    this._previous = this._parent.children[i - 1];
                    break;
                }
                if (i === this._parent.children.length - 1) {
                    this._parent.children.push(this);
                    this._next = null;
                    this._previous = this._parent.children[i];
                    break;
                }
            }
            if (this._next === undefined) {
                this._next = null;
            }
            if (this._previous === undefined) {
                this._previous = null;
            }
            if (this._next) {
                this._next._previous = this;
            }
            if (this._previous) {
                this._previous._next = this;
            }
        }
        this._status &= ~AdvancedTreeNodeStatus.ChangingParent;
        this._status |= AdvancedTreeNodeStatus.Working;
    }
}
