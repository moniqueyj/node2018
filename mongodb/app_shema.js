const http = require('http');
const express = require('express');
const static = require('serve-static');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const path = require('path');
const expressErrorHandler = require('express-error-handler');
const mongoose = require('mongoose');

let database;
let UserSchema;
let UserModel;

function connectDB(){
    let databaseUrl = 'mongodb://localhost:27017/local';
    mongoose.Promise = global.Promise;
    mongoose.connect(databaseUrl);
    database = mongoose.connection
    console.log('***database in connectDB ****',database);
    
    database.on('open', function(){
        console.log('connected with database : ', databaseUrl);
        UserSchema = mongoose.Schema({
            id: {type:String, required:true, unique:true},
            password: {type:String, required:true},
            name: {type:String, index:'hashed'},
            age: {type:Number, 'default':-1},
            created_at: {type:Date, index:{unique:false}, 'default': Date.now()},
            updated_at: {type:Date, index:{unique:false},'default':Date.now()}
        });
        UserSchema.static('findById', function(id,callback){
            return this.fine({'id':id}, callback);
        });
        
//        UserSchema.statics.findById = function(id, callback){
//            return this.find({'id':id},callback);
//        }

        UserSchema.static('findAll', function(callback){
            return this.find({}, callback);
        });
        UserModel = mongoose.model('users2', UserSchema)
        console.log('UserSchema defined' , UserSchema);
        console.log('UserModel defined' , UserModel);
    })
    
    database.on('disconnected', function(){
        console.log('disconned with database');
    });
    database.on('error', function(){
        console.log('error happend while connecting with database');
    });
}

const app = express();
app.set('port',process.env.PORT || 3000);

app.use('/public', static(path.join(__dirname,'public')));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(expressSession({
    secret:'bears',
    resave: false,
    saveUninitialized: true
}));

const router = express.Router();

router.route('/process/login').post(function(req,res){
    console.log('process/login route');
    let paramId = req.body.id ||req.query.id;
    let paramPw = req.body.password || req.query.password;
    console.log(`user id : ${paramId} Password:${paramPw}`);
    
    if(database){
        authUser(database, paramId, paramPw, function(err,collections){
            if (err){
                console.log('error occurs');
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('<h1>Oh No! ERRRORRRRR</h1>');
                res.end();
                return;
            }
            if(collections){
                console.dir(collections);
                res.writeHead('200',{'Content-Type':'text/html;charset=utf8'});
                res.write(`<h1>User logined successfully<h1>`);
                res.write(`<div><p> user: ${collection[0].name} </p></div>}`);
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
    console.log('/process/adduser route');
    let paramId = req.body.id || req.query.id;
    let paramPw = req.body.password || req.query.password;
    let paramName = req.body.name || req.query.name;
    
    console.log('requested paramater : ' + paramName);
    if(database){
        addUser(database, paramId, paramPw, paramName, function(err,result){
            if(err){
                console.log('error occur');
                res.writeHead('200',{'Content-Type':'text/html;charset=uft8'});
                res.write(`<h1>error occurs : ${err}<h1>`);
                res.end();
                return;
            }
            if (result){
                console.dir(result);
                res.writeHead('200',{'Content-Type':'text/html;charset=utf8'});
                res.write(`<h1>new User added to database<h1>`);
                res.write(`<div><p> user: ${paramName} </p></div>`);
                res.end();   
            } else {
                console.log('error occur');
                res.writeHead('200',{'Content-Type':'text/html;charset=utf8'});
                res.write(`<h1>adding new user failed<h1>`);
                res.end(); 
            }
        });
    } else {
        console.log('error occur');
        res.writeHead('200',{'Content-Type':'text/html;charset=utf8'});
        res.write('<h1>did not connected with database</h1>');
        res.end();
             
    }
});

router.route('/process/listuser').post(function(req, res){
    console.log('/process/listuser route');
    
    if (database){
        UserModel.findAll(function(err, results){
           if(err){
                console.log('error occur');
                res.writeHead('200',{'Content-Type':'text/html;charset=uft8'});
                res.write(`<h1>error occurs : ${err}<h1>`);
                res.end();
                return;
           } 
            if(results){
                console.dir(results);
                res.writeHead('200',{'Content-Type':'text/html;charset=utf8'});
                res.write(`<h1>User List<h1>`);
                res.write('<div><ul>')
                for(let i = 0; i <results.length; i++){
                    var curId = results[i]._doc.id;
                    var curName = results[i]._doc.name;
                    res.write(`<li># ${i} -> ${curId} , ${curName} </li>`);
                }
                res.write('</ul></div>');
            } else {
                console.log('error occur');
                res.writeHead('200',{'Content-Type':'text/html;charset=utf8'});
                res.write(`<h1>no searched user<h1>`);
                res.end();
            }
        });
    } else {
        console.log('error occur');
        res.writeHead('200',{'Content-Type':'text/html;charset=utf8'});               res.write(`<h1>no connection with data<h1>`);
        res.end();
    }
});



app.use('/',router);

const authUser = function(db, id, password, callback){
    console.log('authUser called' + id +','+ password);
    
    UserModel.findById(id, function(err, results){
        if(err){
            callback(err, null);
            return;
        }
        console.log('Id %s searhed');
        if(results.length >0){
            if(results[0]._doc.password === password){
                console.log('matched password');
                callback(null, results);
            } else {
                console.log('not match with password');
                callback(null, null);
            }
        } else {
            console.log('there is no matched user exist');
            callback(null,null);
        }
    });
    UserModel.find({'id':id,'password':password},function(err, collections){
        if(err){
            callback(err, null);
            return;
        }
        if(collections.length > 0){
            console.log('found the matching user');
            callback(null, collections);
        } else {
            console.log('Sorry could not find matching user');
            callback(null,collections);
        }
    });
}

const addUser = function(db, id, password, name, callback){
    console.log('addUser function called : '+ id +',' + password+','+name);
    
    let user = new UserModel({'id':id, 'password':password, 'name':name});
    user.save(function(err){
        if(err){
            callback(err,null);
            return;
        }
        console.log('new user data added');
        callback(null, user);
    })
}



const errorHandler = expressErrorHandler({
    static: {
        '404':'./public/error.html'
    }
});

const server = http.createServer(app).listen(app.get('port'),function(){
    console.log('server started!');
    connectDB();
});
