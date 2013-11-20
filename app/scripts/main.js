
console.log('starting');
console.log('#di');
$("#di")[0].valueChanged = function(){
	console.log(this.value);
	if (this.value>0){
		$('#led')[0].turnOn();
	};
	if (this.value==0){
		$('#led')[0].turnOff();
	};

}