const http = require('http');
const express = require('express');
const static = require('serve-static');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');

const app = express();

app.set('port', process.env.PORT || 3000);

app.use('/public', static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.use(cookieParser());
app.use(expressSession({
//https://blog.naver.com/ahn128/221463810245
    //secret - 쿠키를 임의로 변조하는 것을 방지하기 위한 값. 이 값을 통하여 세션을 암호화하여 저장합니다.
    //resave - 세션을 언제나 저장할지(변경하지 않아도) 저장하는 값입니다. express-session documentation에서는 이 값을 false로 하는 것을 권장하고 필요에 따라 true로 설정합니다.
    //saveUninitalized - 세션이 저장되기 전에 uninitialized 상태로 미리 만들어서 저장합니다
    secret:'my key',
    resave: true,
    saveUninitialized:true
}));

const router = express.Router();

router.route('/process/product').get(function(req,res){
    console.log('/process/product routing function called');
    
    if(req.session.user){
        res.redirect('/public/product.html');
    } else {
        res.redirect('/public/login1.html');
    }
});

router.route('/process/login').post(function(req,res){
    console.log('/process/login routing function called');
    let paramId = req.body.id || req.query.id;
    let paramPw = req.body.password || req.query.password;
    console.log('requested paramater : ' + paramId + ',' + paramPw);
    
    if(req.session.user){
        console.log('you are already loged in');
        res.redirect('/public/product.html');
        } else {
            req.session.user = {
                id:paramId,
                name:'yun joo',
                authorized:true                                  
            };
            res.writeHead(200,{'Content-Type':'text/html;charset=utf-8'});
            res.write('<h1>loged in!</h1>');
            res.write('<p> id: '+ paramId + '</p>');
            res.write('<br><br><a href="/public/product.html"> go to product page</a>');
            res.end();
            }
});

router.route('/process/logout').get(function(req,res){
    console.log('/process/logou function called');
    if(req.session.user){
        console.log('log out');
        req.session.destroy(function(err){
            console.log('error occur',err);
            return;
        });
        console.log('session deledeted successfully');
        res.redirect('/public/login1.html');
    } else{
        console.log('please login');
        res.redirect('/public/login1.html');
    }
});

app.use('/',router);
app.use('*',function(req,res){
   res.status(404).send('<h1>page not found</h1>'); 
});

const server = http.createServer(app).listen(app.get('port'),function(){
    console.log('server start');
});