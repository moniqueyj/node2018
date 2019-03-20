const http = require('http');
const express = require('express');

const app = express();
app.set('port', process.env.PORT || 3000);


//middleware .use()
app.use(function(req,res,next){
    console.log('first middle ware');
//    res.redirect('http://google.com');
    let userAgent = req.header('User-Agent');
    let paramName = req.query.name;
    
    res.send(`<h3>User-Agent : ${userAgent} Name : ${paramName}</h3>`);
    
});

//app.use(function(req,res){
//    
//});

const server = http.createServer(app).listen(app.get('port'),function(){
    console.log(`express server start : ${app.get('port')}`);
});