var {
    Thread,
    ThreadMode,
    callStack
} = require('./dist');

const a = new Thread(data => {
    return data;
});

a.computed.subscribe(d => {
    console.log(d);
});

if (a.mode === ThreadMode.WebWorker) {
    console.log('Mode: WebWorker');
} else if (a.mode === ThreadMode.Promise) {
    console.log('Mode: Promise');
} else {
    console.log('Mode: SetTimeout');
}

a.compute('1');
a.compute('2');
console.log(callStack());