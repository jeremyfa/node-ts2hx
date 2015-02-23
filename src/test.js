
var fs = require('fs');
var ts2hx = require('./ts2hx');

var hx = ts2hx(fs.readFileSync(__dirname+'/../example/Example.ts'), null, {strict: true});
fs.writeFileSync(__dirname+'/../example/Example.hx', hx);

process.stdout.write(hx);
