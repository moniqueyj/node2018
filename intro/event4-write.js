var fs = require('fs');

fs.open('./output.txt', 'w', function(err, fd) { 
    if(err) {   
        console.log('error'); 
        console.dir(err); 
        return; } 
    var buf = new Buffer('New Hello!!!!!'); 
    fs.write(fd, buf, 0, buf.length, null, function(err, written, buffer){ 
        if(err){ console.log('while writting file error occurs!'); 
                console.dir(err); 
                return;}
 
        console.log('successfully done.'); 
        var data = buffer.toString();
        console.dir(buffer);
        console.log('data :', data);
        console.log('what is buffer : ', written); 
        fs.close(fd, function(){ 
            console.log('all done'); 
                               });
    });
});