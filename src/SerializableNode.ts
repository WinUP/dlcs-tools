/**
 * Serializable node
 */
export interface SerializableNode<T = any> {
    /**
     * Node name
     */
    key: Readonly<string>;
    /**
     * Node value
     */
    value: T;
    /**
     * Node's children
     */
    children: SerializableNode[];
}

export class SerializableNode {
    private constructor() { }

    /**
     * Create a node
     * @param key Node's name
     * @param value Node's initial value
     */
    public static create<T>(key: string, value: T): SerializableNode<T> {
        return { key: key, value: value, children: [] };
    }

    /**
     * Set node's value starts from root node and search by address
     * @param root Root node
     * @param address Target node's address starts from root
     * @param value New value
     * @description Another way is use SerializableNode.find() to find the node and set value manually.
     * Nodes throw address will be created automatically.
     */
    public static set<T>(root: SerializableNode, address: string, value: T): SerializableNode {
        const node = SerializableNode.find<T>(root, address);
        node.value = value;
        return node;
    }

    /**
     * Get node's value starts from root node and search by address
     * @param root Root node
     * @param address Target node's address starts from root
     * @description Another way is use SerializableNode.find() to find the node and read value manually.
     * Nodes throw address will be created automatically.
     */
    public static get<T = any>(root: SerializableNode, address: string): T {
        return SerializableNode.find<T>(root, address).value;
    }

    /**
     * Drop node and all its children from root's node tree if that node is root's directly or indirectly child.
     * @param root Root node
     * @param node Target node or node's address. Should be different than root
     * @description If you want to drop node's data, just set its value to undefined.
     */
    private static drop(root: SerializableNode, node: SerializableNode | string): void {
        if (typeof node === 'string') {
            if (node === '/') { return; }
            SerializableNode._dropByAddress(root, node);
        } else {
            if (root === node) { return; }
            SerializableNode._dropNode(root, node);
        }
    }

    private static _dropNode(root: SerializableNode, node: SerializableNode): void {
        if (root.children.indexOf(node) > -1) {
            root.children.splice(root.children.indexOf(node), 1);
        } else {
            root.children.forEach(parent => {
                SerializableNode._dropNode(parent, node);
            });
        }
    }

    private static _dropByAddress(root: SerializableNode, address: string): void {
        const hierarchy = address.split('/').slice(1);
        let pointer: SerializableNode = root;
        let parent: SerializableNode = pointer;
        for (let i = 0; i < hierarchy.length; i++) {
            const child = pointer.children.find(v => v.key === hierarchy[i]);
            if (child && i === hierarchy.length - 1) {
                parent.children.splice(parent.children.indexOf(child), 1);
                return;
            } else if (child) {
                parent = pointer;
                pointer = child;
            } else {
                return;
            }
        }
    }

    /**
     * Find node's address starts from given root
     * @param root Root node
     * @param node Target node
     */
    public static address(root: SerializableNode, node: SerializableNode): string | undefined {
        return root === node ? '/' : SerializableNode._address(root, node, '');
    }

    private static _address(root: SerializableNode, node: SerializableNode, prefix: string): string | undefined {
        if (root.children.indexOf(node) > -1) {
            return `${prefix}/${node.key}`;
        } else if (root.children.length === 0) {
            return undefined;
        } else {
            for (let i = 0; i < root.children.length; i++) {
                const child = root.children[i];
                const result = SerializableNode._address(child, node, `${prefix}/${child.key}`);
                if (result) { return result; }
            }
            return undefined;
        }
    }

    /**
     * Find node using address starts from given root, it will create all nodes passed by the address
     * @param root Root node
     * @param address Target address
     */
    public static find<T = any>(root: SerializableNode, address: string): SerializableNode<T> {
        if (address === '/') { return root; }
        const hierarchy = address.split('/').slice(1);
        let pointer: SerializableNode = root;
        hierarchy.forEach(itemKey => {
            let child = pointer.children.find(v => v.key === itemKey);
            if (!child) {
                child = SerializableNode.create(itemKey, null);
                pointer.children.push(child);
            }
            pointer = child;
        });
        return pointer;
    }
}
