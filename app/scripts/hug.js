
(function(){

	// Fill the grid with images from PlaceKitten
	// Fill comment and like number iwth dummy data
	for (var i = 0;i<10;i++){

		var t = $('<img  src="http://placekitten.com/g/700/'+(500+5*i)+'">').appendTo($('#images_grid'))
		var numComments = Math.floor(Math.random()*100);
		var numLikes = Math.floor(Math.random()*100)
		$(t).data('numComments',numComments);
		$(t).data('numLikes',numLikes);
	}
	

	// On hug, like the image in focus
	$('vin-huggable')[0].onHug = function(){

		// Get image in focus
		// This will have to be the most central image, 
		// ie the one whose centroid is closest to the window's centroid



		var img = getImageInFocus();
		var content = $('img');
		content.css({'border':'10px solid black'});
		$(img).css({'border':'10px solid red'});
		$(img).data({'numLikes' : $(img).data('numLikes')+1 });
	}

	// TO DO Fix this
	// Not working so returning first image instead
	getImageInFocus = function(){

		var content = $('img');

		var imgInFocus;
		for (var i=0;i<content.length;i++){
		    var offset = $(content[i]).offset();
			var posY = offset.top - $(window).scrollTop() - $(content[i]).height()/2 ;
			posY = $(window).scrollTop() + 150 + $(window).height()/2- $(content[i]).height()/2 - $(content[i]).offset().top;
			console.log(posY);
			console.log( ($(window).scrollTop() + $(window).height()/2 ));
			if (i==0)
				min = Math.abs(posY);

			if (Math.abs(posY) <= min ){
				imgInFocus = $(content[i]);
			}

		}
		console.log(imgInFocus);
				content.css({'border':'10px solid black'});
		// $(imgInFocus).css({'border':'10px solid red'});
		return $(content)[0];
	}

})();