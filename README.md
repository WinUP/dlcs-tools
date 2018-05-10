# DLCS Tools

![status](https://img.shields.io/travis/WinUP/dlcs-tools.svg?style=flat-square)
[![npm](https://img.shields.io/npm/v/@dlcs/tools.svg?style=flat-square)](https://www.npmjs.com/package/@dlcs/tools)

Tools includes some functions and classes that provide support for other parts of Deus Legem Creation System.

### AdvancedTree<T>

```typescript
import { AdvancedTree, AdvancedTreeNodeStatus } from '@dlcs/tools';
```

Advanced tree is a normal tree with weight values and on/off switches on each node, it has method called ```map()``` that use user given mapper function to map each node of this tree using DFS (O(n)).

| Field name | Default value | Usage        | Example |
|-|:-|:-|-:|
| ```parent: Nullable<AdvancedTree<T>>``` | ```null``` | Get or set parent | ```node.parent = new AdvancedTree<number>() ``` |
| ```status: number``` | ```AdvancedTreeNodeStatus.Unavailable``` | Get status | ```const e = node.status``` |
| ```priority: number``` | ```0``` | Get or set weight value | ```node.priority = 100``` |
| ```next: Nullable<AdvancedTree<T>>``` | ```null``` | Get next node of same level | ```node = node.next``` |
| ```previous: Nullable<AdvancedTree<T>>``` | ```null``` | Get previous node of same level | ```node = node.previous``` |
| ```id: string``` | Given by constructor | Get ID | ```const id = node.id``` |
| ```enabled: boolean``` | ```true``` | Get or set enabled | ```node.enabled = false``` |
| ```content: T \| undefined``` | ```undefined``` |  Get or set content | ```node.content = (message) => message``` |
| ```destroy(): void``` | | Delete this node with all its children | ```node.destroy()``` |
| ```map<U>(mapper: (node: AdvancedTree<T>, result: U, feedback: CancelledEventArgs) => U, initialData: U): U``` | | Map the tree from this node | ```node.map((node, result, feedback) => { feedback.cancelled = true; return result; }, null)``` |
| ```printStructure(): void``` | | Print struccture starts from this node | ```node.printStructure()``` |

For example, in message service, we use ```map()``` to call all listeners:

```typescript
const chain = new Promise<Message>((resolve, reject) => resolve(data));
this.root.map<Promise<Message>>((node, result, feedback) => {
    /* Link all available listeners to promise chain */
}, chain);
```

### Autoname

```typescript
import { autoname, toCamelCase, toPascalCase, toSnakeCase } from '@dlcs/tools';
```

Autoname can deep scan an object and set value of each key to map path using transfer function. It only set key-value pairs that value's type is string.

```typescript
const source = {
    messageConf: '',
    responseConf: {
        mask: '',
        tag: ''
    }
}
autoname(source);
// output: { messageConf: '/messageConf', responseConf: { mask: '/responseConf/mask', tag: '/responseConf/tag' } }
autoname(source, '/', toPascalCase);
// output: { messageConf: '/MessageConf', responseConf: { mask: '/ResponseConf/Mask', tag: '/ResponseConf/Tag' } }
autoname(source, '/', toSnakeCase);
// output: { messageConf: '/message_conf', responseConf: { mask: '/response_conf/mask', tag: '/response_conf/tag' } }
autoname(source, '.', item => item.toUpperCase());
// output: { messageConf: '.MESSAGECONF', responseConf: { mask: '.RESPONSECONF.MASK', tag: '.RESPONSECONF.TAG' } }
autoname(source, '/', 'message://', toPascalCase);
// output: { messageConf: 'message:///MessageConf', responseConf: { mask: 'message:///ResponseConf/Mask', tag: 'message:///ResponseConf/Tag' } }

const source2 = {
    node1: '',
    node2: true,
    node3: 1
}
autoname(source);
// output: { node1: '/node1', node2: true, node3: 1 }
```

This function is not immutable, it will change source's content.

### callStack

```typescript
import { callStack, CallStackItem } from '@dlcs/tools';
```

A function that returns current call stack's information, includes identifiers, file name, file position and line number.

```typescript
const stack: CallStackItem[] = callStack();
console.log(`Current code is in file ${stack[0].fileName}, line number ${stack[0].line}`);
```

We use this function to guess listener's ID if not given by user.

```typescript
const stack = callStack();
new Listener(`[${stack[2].identifiers[0]}]${createUUIDString()}`, service);
```

### CancelledEventArgs

```typescript
import { CancelledEventArgs } from '@dlcs/tools';
```

A class only has one bollean field called cancelled. Use for user when produce cancelable data in message loop.

| Field name | Default value | Usage        | Example |
|-|:-|:-|-:|
| ```cancelled: boolean``` | ```false``` | Should the event be cancelled | ```arg.cancelled = true``` |

```typescript
const arg = new CancelledEventArgs();
arg.cancelled = true;
```

### createUUIDString

```typescript
import { createUUIDString } from '@dlcs/tools';
```

A function returns an upper case UUID v4 string with hyphen.

```typescript
const uuid = createUUIDString(); // e.g. "87E333D4-E195-49A9-94E1-1BF4119B6164"
```

### environment

```typescript
import { environment, ContextEnvironment } from '@dlcs/tools';
```

A function returns context environment includes browser info, device info, etc.

```typescript
const info: ContextEnvironment = environment();
console.log(`Browser: ${info.browser.name}, OS: ${info.system.name}, Device: ${info.device.name}`);
```

### InstantDebugger

```typescript
import { InstantDebugger } from '@dlcs/tools';
```

A class that create short links under ```window.InstantDebug``` for debugging usages.

| Field name | Default value | Usage        | Example |
|-|:-|:-|-:|
| ```static register(name: string, content: any): void``` | | Register an instant debug tool | ```InstantDebugger.register('test', () => ({}))``` |
| ```static remove(name: string): void``` | | Remove an instant debug tool | ```InstantDebugger.remove('test')``` |

For example, in message service, if user set ```useDebugger = true```, then when running application, type ```window.InstantDebug.messageStructureGraph()``` in console can output application's listener structure. Message service use this to register function to InstantDebugger:

```typescript
public set useDebugger(value: boolean) {
    if (value) {
        InstantDebugger.register('messageStructureGraph', () => {
            this.root.printStructure();
        });
    } else {
        InstantDebugger.remove('messageStructureGraph');
    }
    this._debugMode = value;
}
```

```typescript
window.InstantDebugger.messageStructureGraph();
```

### isMatch

```typescript
import { isMatch } from '@dlcs/tools';
```

Test regexp with source (param 2) when tester (param 1) is regexp, or equals to source when tester is string. If tester is null/undefined or empty string, function will return true. If source is null/undefined or empty string, function will return false.

```typescript
isMatch('123', '123'); // true
isMatch('123', '456'); // false
isMatch('', '456'); // true
isMatch('123', ''); // false
isMatch(/\d+/g, '123'); // true
isMatch(null, '123'); // true
```

### isValueAvailable

```typescript
import { isValueAvailable } from '@dlcs/tools';
```

Indicate if target is not null, undefined, or empty string.

```typescript
isValueAvailable(null); // false
isValueAvailable(''); // false
isValueAvailable('123'); // true
```

### SerializableNode

```typescript
import { SerializableNode, ISerializableNode } from '@dlcs/tools';
```

SerializableNode is a way to store simple data like configuration in a tree-based structure that can be serialized to JSON.

```typescript
const root = new SerializableNode('root', undefined); // We need one root node
root.set('/config/message/default_mask', 1); // Save data
root.set('/extra/providers/storage/root_name', 'DLCS');
const defaultMask = root.get('/config/message/default_mask') as number; // Read data

root.get('/config/message/'); // Will be undefined. Parent node does not have children's data.

// Advanced usages
const messageConfig = root.find('/config/message'); // Get raw message node
messageConfig.set('/default_mask', 1); // Use messageConfig as root in this scene
const messageConfigAddress = root.address(messageConfig); // Will get messageConfig's address starts from root: /config/message
root.drop(messageConfig); // Drop messageConfig node and all its children
root.drop('/config/message'); // Same as above

// Serialize and deserialize
const json = JSON.stringify(root.serialize());
const new_root = SerializableNode.deserialize(JSON.parse(json));
```

**Attention: _$k and _$v are keywords of SerializableNode, they cannot be any node's key (not value).**

### Thread<T, U>

```typescript
import { Thread, ThreadMode } from '@dlcs/tools';
```

Create thread using web worker/promise/setTimeout and rxjs. See Thread's documentation comments for more information. Please allow ```blob:``` in your security settings to enable worker.

Thread has three modes: WebWorker, Promise and setTimeout. If ```mode``` is not given by constructor, Thread will try to use WebWorker first, then Promise, finally setTimeout.

| Field name | Default value | Usage        | Example |
|-|:-|:-|-:|
| ```computed: EventEmitter<U>``` | ```new EventEmitter()``` | Callback of data computed | ```thread.computed.subscribe(v => ({}))``` |
| ```stop(): boolean``` | | Destroy thread | ```thread.stop()``` |
| ```compute(value: T): void``` | | Send a value to thread for compute | ```thread.compute('test')``` |

It should be easy to create native threads now:

```typescript
const thread = new Thread<string, number>((value: string) => +value);
thread.computed.subscribe(value => console.log(value));
thread.compute('123');
```

Notice: handler function (in constructor)'s ```this``` pointer will be redirect to worker's context in WebWorker mode. Besides, at that situation handler function cannot access any data out of worker's context.