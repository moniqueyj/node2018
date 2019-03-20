var Calc = require('./event4-2-test-2');

var calc1 = new Calc();
calc1.emit('stop');
console.log('stop event sent to Calc');
var sum = calc1.add(5,10);
console.log('add event :' , sum );
