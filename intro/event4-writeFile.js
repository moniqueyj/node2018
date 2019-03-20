var fs = require('fs');

fs.writeFile('./output.txt', 'hello~', function(err){ if(err){ console.log('error : ' ,err); console.dir(err); return;} console.log('output.txt is created and finish writting');
});
