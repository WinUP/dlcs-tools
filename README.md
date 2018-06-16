# DLCS Tools

![status](https://img.shields.io/travis/WinUP/dlcs-tools.svg?style=flat-square)
[![npm](https://img.shields.io/npm/v/@dlcs/tools.svg?style=flat-square)](https://www.npmjs.com/package/@dlcs/tools)

Tools includes some functions and classes that provide support for other parts of Deus Legem Creation System.

### AdvancedTree<T>

```typescript
import { AdvancedTree, AdvancedTreeNodeStatus } from '@dlcs/tools';
```

Advanced tree is a normal tree with weight values and on/off switches on each node, it has method called ```map()``` that use user given mapper function to map each node of this tree using DFS (O(n)).

```typescript
const root = new AdvancedTree<number>(0);
const child1 = new AdvancedTree<number>(1, 'ID: 1');
const child2 = new AdvancedTree<number>(2, 'ID: 2');

child1.parent = child2.parent = root; // set parent
child2.next; // in this situation, next is undefined
child12.priority = 100; // set priority
child2.next; // now next is child1
child1.previous; // also child1's previous is child2
child2.enabled = false; // disable child2
child1.content += child2.content; // read and write content
const sum = root.map<number>((node, result, feedback) => result += node.content, 0); // sum all node's value
// because child2 is disabled, result should be child1.content + root.content
root.destroy(); // destroy this tree
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
// in safari, information will be less than other browsers
```

### CancelledEventArgs

```typescript
import { CancelledEventArgs } from '@dlcs/tools';
```

A class only has one bollean field called cancelled. Use for user when produce cancelable data in message loop.

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
const info: ContextEnvironment = environment;
console.log(`Browser: ${info.browser.name}, OS: ${info.system.name}, Device: ${info.device.name}`);
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

```typescript
const thread = new Thread<string, number>((value: string) => +value);
thread.compute('123');
thread.computed = value => {
    console.log(value)
    thread.stop(); // destroy thread if thread is not using Promise mode
};
```

Notice: handler function (in constructor)'s ```this``` pointer will be redirect to worker's context in WebWorker mode. Besides, at that situation handler function cannot access any data out of worker's context.