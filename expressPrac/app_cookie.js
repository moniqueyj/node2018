const http = require('http');
const express = require('express');
const static = require('serve-static');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();
app.set('port', process.env.PORT||3000);

app.use('/public', static(path.join(__dirname,'public')));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(cookieParser());

const router = express.Router();

router.route('/process/setUserCookie').get(function(req,res){
    console.log('/setusercookie routing function called');
    res.cookie('user',{
        id:'mike',
        name:'girl world',
        authorized:true
    });
    res.redirect('/process/showCookie');
});

router.route('/process/showCookie').get(function(req,res){
    console.log('showcookie function caleed');
    res.send(req.cookies);
});

app.use('/',router);
app.use('*',function(req,res){
    res.status(404).send('<h1>Error</h1>');
});

const server = http.createServer(app).listen(app.get('port'),function(){
    console.log('server start');
});
