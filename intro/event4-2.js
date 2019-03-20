process.on('exit', function(){
  console.log('exit event occurs!');
});

setTimeout(function() {  console.log('after 2 sc processed');
  process.exit();
}, 2000);

console.log('it will start 2sc later!');