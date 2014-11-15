
var fs = require('fs');
var ts2hx = require('./ts2hx');

var hx = ts2hx(fs.readFileSync(__dirname+'/../Example.ts'));

process.stdout.write(hx);
