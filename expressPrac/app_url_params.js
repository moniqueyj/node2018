const http = require('http');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const static = require('serve-static');
const app = express();
app.set('port', process.env.PORT || 3000);

app.use('/public',static(path.join(__dirname,'public')));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

const router = express.Router();



router.route('/process/login/:name').post(function(req,res){
    console.log('/process/login/:name route received');
    let paramName = req.params.name;
    let paramId = req.body.id || req.query.id;
    let paramPw = req.body.password || req.query.password;
    
    res.writeHeader(200, {'Content-Type':'text/html;charset=utf8'});
    res.write('<h1>respond from server</h1>');
    res.write(`<div><p>ID : ${paramName}</p></div>`);
    res.write(`<div><p>ID : ${paramId}</p></div>`);
    res.write(`<div><p>PASSWORD : ${paramPw}</p></div>`);
    res.end();
});

app.all('*', function(req, res){
    res.status(404).send('<h1> ERRORRRRRRRRRRRRRR</h1>');
});
app.use('/', router);

const server = http.createServer(app).listen(app.get('port'), function(){
    console.log(`server start : ${app.get('port')}`);
});