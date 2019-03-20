var fs = require('fs');
var infile = fs.createReadStream('./output.txt', {flags:'r'});

infile.on('data', function(data){
    console.log('read data : '+ data);
});

infile.on('end', function(){
    console.log('finish reading');
})