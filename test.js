var {
    SerializableNode
} = require('./dist');

const a = new SerializableNode('base', 'base_value');

a.set('/state/music/list', [ { v: 100, f: '1' }, { v: 50, f: '2' } ]);
a.set('/state/script/file', '123.script');
a.set('/state/script/line', 11);

const b = JSON.stringify(a.serialize(), null, 2);

const a2 = SerializableNode.deserialize(JSON.parse(b));

console.log(a2.get('/state/script/file'));

console.log(JSON.stringify(a2.serialize(), null, 2));