const http = require('http');
const express = require('express');
const static = require('serve-static');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const expressErrorHandler = require('express-error-handler');
const mysql = require('mysql');

let pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'FantasticRYND4!',
    database: 'user_DB'
});

const app = express();
app.set('port', process.env.PORT || 3000);

app.use('/public', static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cookieParser());
app.use(expressSession({
    secret: 'flower',
    resave: false,
    saveUninitialized: true
}));


const router = express.Router();

router.route('/process/login').post(function(req, res) {
    console.log('/process/login route');
    let paramId = req.body.id || req.query.id;
    let paramPw = req.body.password || req.query.password;
    console.log('requested paramater ' + paramId + ',' + paramPw);


    authUser(paramId, paramPw, function(err, rows) {
        if (err) {
            console.log('error occur');
            res.writeHead('200', { 'Content-Type': 'text/html;charset=utf8' });
            res.write(`<h1>error occurs ${err.stack}<h1>`);
            res.end();
            return;
        }
        if (rows) {
            console.dir(rows);
            res.writeHead('200', { 'Content-Type': 'text/html;charset=utf8' });
            res.write(`<h1>User logined successfully<h1>`);
            res.write(`<div><p> user: ${rows[0].name} </p></div>}`);
            res.write('<br><br><a href ="/public/login.html">login again</a>');
            res.end();
            return;
        } else {
            console.log('error occur');
            res.writeHead('200', { 'Content-Type': 'text/html;charset=utf8' });
            res.write(`<h1>No user data exist<h1>`);
            res.end();
            return;
        }
    });
});

router.route('/process/adduser').post(function(req, res) {
    console.log('/process/adduser routeing function called');

    let paramId = req.body.id || req.qeury.id;
    let paramPw = req.body.password || req.query.password;
    let paramName = req.body.name || req.query.name;
    let paramAge = req.body.age || req.query.age;

    console.log('requested paramater : ' + paramName + ',' + paramPw + ',' + paramAge);
    if (pool) {
        addUser(paramId, paramName, paramAge, paramPw, function(err, addedUser) {
            if (err) {
                console.log('error occur 1 : ', err.stack);
                res.writeHead('200', { 'Content-Type': 'text/html;charset=utf8' });
                res.write(`<h1>error occurs<h1>`);
                res.end();
                return;
            }
            if (addedUser) {
                console.dir(addedUser);
                res.writeHead('200', { 'Content-Type': 'text/html;charset=utf8' });
                res.write(`<h1>new User added to Pool <h1>`);
                res.write(`<div><p> user: ${paramName} </p></div>}`);
                res.end();
            } else {
                console.log('error occur 2: ', err.stack);
                res.writeHead('200', { 'Content-Type': 'text/html;charset=utf8' });
                res.write(`<h1>adding new user failed<h1>`);
                res.end();
            }
        })
    } else {
        console.log('error occur');
        res.writeHead('200', { 'Content-Type': 'text/html;charset=utf8' });
        res.write('<h1>did not connected with database</h1>');
        res.end();
    }
});

app.use('/', router);

let authUser = function(id, password, callback) {
    console.log('authUser called' + id + ',' + password);

    pool.getConnection(function(err, conn) {
        if (err) {
            if (conn) {
                conn.release();
            }
            callback(err, null);
            return;
        }
        console.log('the tread id that connected with database:' + conn.threadId);
        let columns = ['id', 'name', 'age'];
        let tableName = 'users';
        let exec = conn.query("Select ?? from ?? where id= ? and password =?", [columns, tableName, id, password], function(err, rows) {
            conn.release();
            console.log('excuting SQL : ' + exec.sql);

            if (err) {
                console.log('****WHAT IS ERROR****', err);
                callback(err, null);
                return;
            }

            if (rows.length > 0) {
                console.log('found user that matches Id [%s], password [%s]');
                callback(null, rows);
            } else {
                console.log('could not find matching user');
                callback(null, null);
            }
        });
    });
};

let addUser = function(id, name, age, password, callback) {
    console.log(`addUser function called : ${id} , ${password}, ${name}`);

    pool.getConnection(function(err, conn) {
        if (err) {
            if (conn) {
                conn.release();
            }
            callback(err, null);
            return;
        }
        console.log(`database connection thread id : ${conn.thradId}`);
        let data = { id, name, age, password };
        let exec = conn.query('INSERT INTO users SET?', data, function(err, result) {
            conn.release();
            console.log(`processing SQL : ${exec.sql}`);

            if (err) {
                console.log('while processing SQL error occur', err);
                callback(err, null);
                return;
            }
            callback(null, result);
        })
    });
}

const errorHandler = expressErrorHandler({
    static: {
        '404': './public/error.html'
    }
});

app.use(expressErrorHandler.httpError(404));
app.use(errorHandler);

const server = http.createServer(app).listen(app.get('port'), function() {
    console.log('server start');
});