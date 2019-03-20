const http = require('http');
const fs = require('fs');
const server = http.createServer();
const host = 'localhost';
const port = 3000;

server.listen(port, host, 11000, function(){
    console.log('server start.');
})

server.on('connection', function(socket){
    console.log('client connected');
});

server.on('request', function(req,res){
    console.log('received client request');
    fs.readFile('./es6/heart.png', function(err, data){
        if (err){
            console.log('err occur :', err);
            console.dir(err);
            return;
        } 
        res.writeHead(200, {'Content-Type':'image/png'});
        res.write(data);
        res.end();
    });
});