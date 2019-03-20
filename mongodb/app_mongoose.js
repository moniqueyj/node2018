const http = require('http');
const express = require('express');
const static = require('serve-static');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser =require('cookie-parser');
const expressSession = require('express-session');
const expressErrorHandler = require('express-error-handler');
const mongoose = require('mongoose');

let database;
let UserSchema;
let UserModel;

function connectDB(){
    let databaseUrl = 'mongodb://localhost:27017/local';
    mongoose.Promise = global.Promise;
    mongoose.connect(databaseUrl);
    database = mongoose.connection;
    
    database.on('open', function(){
        console.log('connected with database : ' + databaseUrl);
        mongoose.Schema({
            id: String,
            name: String,
            password: String
        });
        console.log('UserSchema defined');
        mongoose.model('users', UserSchema);
        console.log('userModel defined');
    });
    database.on('disconnected', function() {
        console.log('disconncected with database');
    });
    database.on('error', console.error.bind(console, 'mongoose connection error'));
}

const app = express();
app.set('port', process.env.PORT || 3000);

app.use('/public', static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.use(cookieParser());
app.use(expressSession({
    secret:'flower',
    resave: false,
    saveUninitialized:true
}));


const router = express.Router();

router.route('/process/login').post(function(req,res){
    console.log('/process/login route');
    let paramId = req.body.id || req.query.id;
    let paramPw = req.body.password || req.query.password;
    console.log('requested paramater '+ paramId +',' + paramPw);
    
    if(database){
        authUser(database, paramId, paramPw, function(err,docs){
            if(err){
                console.log('error occur');
                res.writeHead('200',{'Content-Type':'text/html;charset=utf8'});
                res.write(`<h1>error occurs<h1>`);
                res.end();
                return;
            }
            if(docs){
                console.dir(docs);
                res.writeHead('200',{'Content-Type':'text/html;charset=utf8'});
                res.write(`<h1>User logined successfully<h1>`);
                res.write(`<div><p> user: ${docs[0].name} </p></div>}`);
                res.write('<br><br><a href ="/public/login.html">login again</a>');
                res.end();   
                return;
            } else {
                console.log('error occur');
                res.writeHead('200',{'Content-Type':'text/html;charset=utf8'});
                res.write(`<h1>No user data exist<h1>`);
                res.end();   
                return;
            }
        });
    } else {
        console.log('error occurs');
        res.writeHead('200',{'Content-Type':'text/html;charset=utf8'});
        res.write('<h1>did not connected with database</h1>');
        res.end();
    }
    
});

router.route('/process/adduser').post(function(req,res){
    console.log('/process/adduser routeing function called');
    
    let paramId = req.body.id || req.qeury.id;
    let paramPw = req.body.password || req.query.password;
    let paramName = req.body.name || req.query.name;
    
    console.log('requested paramater : ' + paramName );
    if(database){
        addUser(database, paramId, paramPw, paramName, function (err, result) {
            if (err) {
                console.log('error occur');
                res.writeHead('200',{'Content-Type':'text/html;charset=utf8'});
                res.write(`<h1>error occurs<h1>`);
                res.end();
                return;
                } 
            if(result){
                console.dir(result);
                res.writeHead('200',{'Content-Type':'text/html;charset=utf8'});
                res.write(`<h1>new User added to database<h1>`);
                res.write(`<div><p> user: ${paramName} </p></div>}`);
                res.end();   
            } else {
                console.log('error occur');
                res.writeHead('200',{'Content-Type':'text/html;charset=utf8'});
                res.write(`<h1>adding new user failed<h1>`);
                res.end();   
            }
        })
    } else {
        console.log('error occur');
        res.writeHead('200',{'Content-Type':'text/html;charset=utf8'});
        res.write('<h1>did not connected with database</h1>');
        res.end();
                }
});

app.use('/',router);

let authUser = function(db,id,password,callback){
    console.log('authUser called'+id + ','+password);
    UserModel.find({'id':id, 'password':password}, function(err, docs){
        if(err){
            callback(err, null);
            return;
        }
        if(docs.length > 0){
            console.log('find the matching user');
            callback(null,docs);
        } else {
            console.log('couldn\'t find matching user');
            callback(null,docs);
        }
    });
}

let addUser = function(db, id, password, name, callback){
    console.log(`addUser function called : ${id} , ${password}, ${name}`);
    
    let user = new UserModel({'id':id, 'password':password,'name':name});
    user.save(function(err){
        if(err){
            callback(err,null);
            return;
        }
        console.log('New user data added');
        callback(null, user);
    });
}

const errorHandler = expressErrorHandler({
   static:{
       '404':'./public/error.html'
   } 
});

app.use(expressErrorHandler.httpError(404));
app.use(errorHandler);

const server = http.createServer(app).listen(app.get('port'),function(){
    console.log('server start');
    connectDB();
});