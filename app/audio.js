
// Initalize Spotify Client
// initialize client with app credentials
SC.initialize({
  client_id: '8333bfd1574c73c781afc6506361447a',
  redirect_uri: 'http://localhost:9000/'
});

// initiate auth popup
SC.connect(function() {
  SC.get('/me', function(me) { 
    alert('Hello, ' + me.username); 
  });
});


SC.stream("/tracks/293", function(sound){
  sound.play();
});
