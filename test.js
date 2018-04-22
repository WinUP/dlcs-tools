var { autoname, toCamelCase, toPascalCase, toSnakeCase } = require('./dist');

var source = {
    testSource1: '',
    test2: ['' , ''],
    testSource3: {
        testSource31: '',
        test32: {
            test321: '',
            TestSource322: ''
        }
    }
}

autoname(source, '/', toSnakeCase);
console.log(source);