//middle ware static -> 특정 폴더의 파일들을 특정 패스로 접근할 수 있도록 열어주는 역활을 함 https://horajjan.blog.me/221337515650
const http = require('http');
const express = require('express');
const static = require('serve-static');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
app.set('port', process.env.PORT || 3000);

//__dirname 현재 실행한 파일이 포함된 프로젝트의 경로 중 현재파일을 제외한 경로를 뜻.
//여기서 경로는 주로 실행 중인 서버 파일을 제외한 경로로서, 
//C:WabcWdefWmain.js에서 서버파일이 main.js라고 가정했을때 __dirname은 C:WabcWdefW까지를 뜻.
//path.join(경로, ...) : 여러 인자를 넣으면 하나의 경로로 합쳐줍니다. 상대경로인 ..과 .도 알아서 처리해줍니다
//path.resolve(경로, ...) : path.join()과 비슷하지만 차이가 있습니다
//* join과 resolve의 차이
//: path.join과 path.resolve 메서드는 비슷해 보이지만 동작 방식이 다릅니다. path.resolve는 /를 만나면 절대 경로로 인식해서 앞의 경로를 무시하고, path.join은 상대경로로 처리합니다
//path.join('/a', '/b', 'c'); /*  결과: /a/b/c */
//path.resolve('/a', '/b', 'c'); /*  결과: /b/c */

app.use(static(path.join(__dirname, 'public'))); //localhost:3000/image/heart.png

//app.use('/public', static(path.join(__dirname, 'public')));
//-> localhost:3000/public/image/heart.png

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());


app.use(function(req, res, next){
    console.log('first middleware');
    let userAgent = req.header('User-Agent');
//    let paramsName = req.query.name;
//    let paramsName = req.body.name;
    let paramId = req.body.id || req.query.id;
    
    res.send(`<h3>User-Agent : ${userAgent}</h3><h3>Name: ${paramId}</h3>`);
});

const server = http.createServer(app).listen(app.get('port'), function(){
    console.log(`server start : ${app.get('port')}`);
});
