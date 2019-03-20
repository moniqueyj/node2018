const http = require('http');
const server = http.createServer();

const port = 3000;
const host = 'localhost';

server.listen(port,host, 50000, function(){
    console.log('server start! ' +host +':'+ port );
});

server.on('connection', function(socket){
    console.log('connected with client');
});

server.on('request', function(req, res){
    console.log('received request from client');
//    console.dir(req);
    res.writeHead(200,{'Content-Type':'text/html;charset=utf-8'});
    res.write('<h1>respoding from server :)</h1>');
    console.log('header info : ', res);
    res.end();
});

