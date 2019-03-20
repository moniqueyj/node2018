const http = require('http');
const express = require('express');
const static = require('serve-static');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser =require('cookie-parser');
const expressSession = require('express-session');
const expressErrorHandler = require('express-error-handler');
const MongoClient = require('mongodb').MongoClient;

let database;

function connectDB(){
    let databaseUrl = 'mongodb://localhost:27017';
    MongoClient.connect(databaseUrl,{useNewUrlParser: true}, function(err,client){
        if(err){
            console.log('error occur while connecting database');
            return;
        }
        console.log('connected with database :' + databaseUrl);
        database = client.db('local');
    });
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
    var users = db.collection('users');
    users.find({'id':id, 'password':password}).toArray(function(err, docs){
        if(err){
            callback(err,null);
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
    
    let users = db.collection('users');
    
    users.insertMany([{'id':id,'password':password,'name':name}], function(err,result){
        if (err) {
            callback(err,null);
            reuturn;
        }
        if(result.insertedCount > 0 ){
            console.log('user added :'+ result.instertedCount);
            callback(null,result);
        } else {
            console.log('no added record found',result);
            console.log('total database : ', users);
            callback(null,null);
        }
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