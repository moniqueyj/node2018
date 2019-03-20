const express = require('express');
const http = require('http');

const app = express();

app.set('port', process.env.PORT || 3000); // set(name,value)
//set으로 설정하고 get으로 뺀다. get(name)

//middleware 지정할땐 .use함수 사용
app.use(function(req,res,next){
    console.log('first middle ware called');
//    res.writeHead(200, {'Content-Type':'text/html;charset=utf8'});
//    res.end('<h1>responding from server</h1>');
    
//    req.user = 'mike';
    
    
    next();
});

app.use(function(req,res,next){
    console.log('second middleware called');
//    res.send('<h1>respond from server : '+ req.user + '</h1>');
    
    let person = {name:'girls world', age:20};
//    res.send(person);
    
    let personStr = JSON.stringify(person);
//    res.send(personStr);
    
    res.writeHead('200', {'Content-Type':'application/json; charset=utf8'});
//    res.write(person);
    res.write(personStr);
    res.end();
    
});

const server = http.createServer(app).listen(app.get('port'), function(){ 
    console.log('express server start : ' + app.get('port'));
});

