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
        console.log('database connected :' + databaseUrl);
        
        createUserSchema();
    
        doTest();
    });
    database.on('disconnected', function(){
        console.log('disconnected with database');
    });
    database.on('error', function(){
        console.log('mongoose connection error');
    });
}

function createUserSchema(){
    UserSchema = mongoose.Schema({
            id:{type:String, required: true, unique: true},
            name: {type:String, index:'hashed'},
            age:{type:Number, 'default':-1},
            created_at:{type:Date, index:{unique:false}, 'default':Date.now()},
            updated_at:{type:Date, index:{unique:false}, 'default':Date.now()}
        });
    UserSchema.virtual('info').set(function(info){
        let splitted = info.split(' ');
        this.id = splitted[0];
        this.name = splitted[1];
        console.log('virtual info set :' + this.id + ',' + this.name);
    }).get(function(){
        return this.id + ' ' + this.name
    });
//       UserSchema.static('findById', function(id,callback){
//            return this.fine({'id':id}, callback);
//        });
//       UserSchema.static('findAll', function(callback){
//            return this.fine({}, callback);
//        });
        UserModel = mongoose.model('users4',UserSchema)
        console.log('userModel defined : ' , UserModel);
}

function doTest(){
    let user = new UserModel({'info':'test01 girlsworld'});
    user.save(function(err){
        if(err){
            console.log('error');
            return;
        }
        console.log('data added');
    });
}

connectDB();