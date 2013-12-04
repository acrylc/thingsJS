
var dancer = new Dancer();

// Using an audio object
var a = new Audio();
a.src = 'song.mp3';
dancer.load( a );


(function(){

// var dancer = new Dancer();

// // Using an audio object
// var a = new Audio();
// a.src = 'song.mp3';
// dancer.load( a );


	$('x-button')[0].onClick = function(){
		console.log('CLICKED');
		if (!dancer.isPlaying())
			dancer.play();
		else
			dancer.pause();
	}

	$('#volume')[0].onTurn = function(){
		console.log('Angle is ' + this.angle);
		dancer.setVolume(this.angle*100);
		console.log('VOlume is ' + dancer.getVolume());
	}


})();