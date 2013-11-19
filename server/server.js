

// Create a websocket server and listen
// to port 8080
var socket = require('socket.io');
var io = socket.listen(8080);


// Set the server to be an mqtt client that publishs
// to the MQTT client messages that need to be routed
// to the arduino
var mqtt = require('mqtt');
var client = mqtt.createClient(1883, '162.243.38.166');
client.subscribe('arduino');

io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  
  socket.on('input', function (data) {
  	// console.log('received other event data');
   //  console.log(data);
    socket.emit('digitalWrite', {msg:data});
  });

  // readFromPin reads a sensor's value and re-routes it to virtual element
  // type : digitalWrite   ->   digitalWrite(pin, value); 
  socket.on('readFromPin', function(data){
    console.log('test write to arduino');
    console.log(data);
  });

  // writeToPin reads an actuator's value and rerouts it to physical element
  // type : digitalWrite   ->   digitalWrite(pin, value); 
  socket.on('writeToPin', function(data){
  	console.log('test write to arduino');
  	console.log(data);
    client.publish('b', JSON.stringify(data) );

  });

  // InitPin rerouts message to arduino to call 
  // pinMode(pin, value) 
  // on corresponding arduino with given ID     
  socket.on('initPin', function(data){
    console.log('initalizing pin');
    console.log(JSON.stringify(data));
    // socket.emit('initPin', {msg:data});
    client.publish('b', JSON.stringify(data) );

  })

});

