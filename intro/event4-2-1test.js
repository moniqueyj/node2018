process.on('tick', function(count){ console.log('tick event occurs : ' + count);
});

setTimeout(function(){
  console.log('processed after 2 sc'); process.emit('tick', '2');
}, 2000);
