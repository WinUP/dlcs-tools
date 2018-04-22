var { SerializableNode, environment } = require('./dist');

const root = SerializableNode.create('root', undefined);
SerializableNode.set(root, '/test1/test2/test3', 1);

const node = SerializableNode.find(root, '/test1/test2/test3');

console.log(SerializableNode.get(node, '/'));
console.log(environment());