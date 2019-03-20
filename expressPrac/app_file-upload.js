const http = require('http');
const express = require('express');
const static = require('serve-static');
const path = require('path');
const uuid = require('uuid');
const bodyParser = require('body-parser');
const cookieParser =require('cookie-parser');
const expressSession = require('express-session');
//file upload용 미들웨어
const multer = require('multer');
const fs = require('fs');
//client에서 ajax로 요청시 cors(다중서버접속)지원
const cors = require('cors');

const app = express();
app.set('port', process.env.PORT || 3000);

app.use('/public', static(path.join(__dirname, 'public')));
app.use('/uploads', static(path.join(__dirname, 'uploads')));

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.use(cookieParser());
app.use(expressSession({
    secret:'flower',
    resave: false,
    saveUninitialized:true
}));

//클라이언트에서 ajax로 요청했을때 CORS(다중 서버 접속)지원
app.use(cors());

//multer middle ware : middleware use body-parser -> multer -> router

let storage = multer.diskStorage({
    destination: function(req,file,callback){
        callback(null, 'uploads')
    },
    filename:function(req,file,callback){
        console.log('')
        callback(null, uuid.v4()+path.extname(file.originalname));
    }
});

let upload = multer({
    storage: storage,
    limits: {
        files:10,
        fileSize: 1024*1024*1024
    }
})


const router = express.Router();

//session
router.route('/process/login').post(function(req,res){
    console.log('/public/login route');
    
    let paramsId = req.body.id || req.query.id;
    let paramsName = req.body.name || req.query.name;
    let paramsPassword = req.body.password || req.query.password;
    
    if(req.session.user){
        redirect('/public/product.html');
    } else {
        req.session.user = {
            id: paramsId,
            name: paramsName,
            authorized: true
        };
        res.writeHead('200',{'Content-Type':'text/html;charset-utf-8'});
        res.write('<h1>loged in</h1><br>')
        res.write('<user session info : ' + req.session);
        res.write('<br><br><a href="/public/product.html">Go to product page</a>');
        res.end();
    }
});

router.route('/process/product').get(function(req,res){
    console.log('/public/product route');
    if(req.session.user){
        res.redirect('/public/product.html');
    } else {
//        res.write('<h3>you need to login to see product</h3>');
        res.redirect('/public/login1.html');
    }
});

router.route('/process/logout').get(function(req,res){
    console.log('/public/logout route');
    if(req.session.user){
        req.session.destroy(function(err){
            console.dir(err);
            return;
        });
        console.log('session destroyed successfully');
        res.redirect('/public/login1.html');
    } else {
        console.log('please log in');
        res.redirect('/public/login1.html');
    }
});



//cookie
router.route('/process/setUserCookie').get(function(req,res){
    console.log('set user cookie route');
    res.cookie('user',{
        id:'rose',
        name:'alicia',
        authorized:true
    });
    res.redirect('/process/showUserCookie');
});

router.route('/process/showUserCookie').get(function(req,res){
    console.log('show user cookie route');
    res.send(req.cookies);
});


//upload file route
router.route('/process/photo').post(upload.array('photo',1),function(req,res){
    console.log('/process/photo route');
    
    try{
        let files= req.files;
        
        console.dir('#========== first upload file info =========#');
        console.dir(req.files[0]);
        console.dir('#=======#');
        
        let originalName='',
            fileName='',
            mimetype='',
            size = 0
        
        if (Array.isArray(files)){
            console.log('number of files in array : %d',files.length);
           
            for(let index=0;index<files.length;index++){
                originalName = files[index].originalname;
                fileName = files[index].filename;
                mimetype = files[index].mimetype;
                size = files[index].size;
            }
        } else {
            console.log('num of files : 1');
            originalName = files[index].originalname;
            fileName = files[index].filename;
            mimetype = files[index].mimetype;
            size = files[index].size;
        }
        console.log('current file info : ' + originalName + ',' + fileName + ',' + mimetype + ',' + size);
        res.writeHead('200',{'Content-Type':'text/html;charset=utf-8'});
        res.write('<h3>upload file successfully');
        res.write('<hr>');
        res.write('<p>original file name : ' + originalName + ' -> saved file name : ' + fileName + '</p>' );
        res.write('<p>size of file : ' + size + '</p>');
        res.end();
    } catch(err) {
        console.dir(err.stack);
    }
});


app.use('/',router);
app.use('*',function(req,res){
    res.status(404).send(`<h1>${req.statusCode} page NOT found</h1>`);
});



const server = http.createServer(app).listen(app.get('port'),function(){
    console.log('server start');
});