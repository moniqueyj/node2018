var output = 'hello world';
var buffer1 = new Buffer(20);
var len = buffer1.write(output, 'utf8');
console.log('buffer string length : '+ len);
console.log('buffer string : ' + buffer1.toString());

console.log('is buffer?' + Buffer.isBuffer(buffer1));

var byteLen = Buffer.byteLength(buffer1);
console.log('byte lenght : '+ byteLen);
var strl = buffer1.toString('utf8', 0, 11);
console.log('strl : ' + strl);

var buffer2 = Buffer.from('wow','utf8');
console.log('second buffer length : ' + Buffer.byteLength(buffer2));
var strl1 = buffer2.toString('utf8', 0, 3);
console.log('strl : ' + strl1);
