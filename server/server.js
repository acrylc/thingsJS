var socket = require('socket.io');
var io = socket.listen(8080);
io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('input', function (data) {
  	console.log('received other event data');
    console.log(data);
    socket.emit('digitalWrite', {msg:data});
  });
});
