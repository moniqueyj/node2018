const http = require('http');

const server = http.createServer();

var host = 'localhost' //or ip address (localhost means itself or yourself)
const port = 3000;
//server.listen(port, host, max of user for this server, callback)
server.listen(port,host, 50000, function(){
    console.log('server start! ' +host +':'+ port );
});

//event는 emmit으로 보내고 on으로 받는다.