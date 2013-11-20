

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
    

    // ******************** ARDUINO to VIRTUAL ********************
    
    // On DIGITAL READ 
    var msg = '{"value":1, "arduinoId":0, "pin":4}';
    var data = JSON.parse(msg);
    console.log(data);
    socket.emit('digitalRead', data);

    // // readFromPin reads a sensor's value and re-routes it to virtual element
    // // type : digitalWrite   ->   digitalWrite(pin, value); 
    // socket.on('readFromPinSV', function(data){
    //     console.log('test write to arduino');
    //     console.log(data);
    //     socket.emit('vDigitalRead', {'value':1, 'arduinoId':0,'pin':4});
    // });

    // ******************** VIRTUAL to ARDUINO ********************

    // InitPin rerouts message to arduino to call 
    // pinMode(pin, value) 
    // on corresponding arduino with given ID     
    socket.on('initPin', function(data){
        console.log('initalizing pin');
        console.log(JSON.stringify(data));
        // socket.emit('initPin', {msg:data});
        client.publish('b', JSON.stringify(data) );
    });

    // writeToPin reads an actuator's value and rerouts it to physical element
    // type : digitalWrite   ->   digitalWrite(pin, value); 
    socket.on('writeToPin', function(data){
        console.log('test write to arduino');
        console.log(data);
        client.publish('b', JSON.stringify(data) );
    });

});

