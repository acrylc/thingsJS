var socket = require('socket.io');
var io = socket.listen(8080);
io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  
  socket.on('input', function (data) {
  	// console.log('received other event data');
   //  console.log(data);
    socket.emit('digitalWrite', {msg:data});
  });

  // writeToPin writes to a pin, given type
  // type : digitalWrite   ->   digitalWrite(pin, value); 
  socket.on('writeToPin', function(data){
  	console.log('test write to arduino');
  	console.log(data);
  });

  // InitPin rerouts message to arduino to call 
  // pinMode(pin, value) 
  // on corresponding arduino with given ID     
  socket.on('initPin', function(data){
    console.log('initalizing pin');
    console.log(data);
    socket.emit('initPin', {msg:data});
  })


});

