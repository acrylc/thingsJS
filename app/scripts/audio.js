// Sound variables
const PATH = 'music/',
        SOUNDS = ['1','2','3'];
        var myAudioContext, myAudioAnalyser,
            myBuffers = {}, mySource,
            myNodes = {},   mySpectrum,
            isPlaying = false;
 
// Sound value variables
highpassValue = 0.5;
panValue = 0.5;
volumeValue = 1;
dataset = [highpassValue, panValue, volumeValue];

// Spectrum drawing variables
spectrum = [];
firstDraw = true;

// @func init Initalizes the audioAnalyser object and fetches
// the music to be triggered on play
function init() {
    if('webkitAudioContext' in window) {
        myAudioContext = new webkitAudioContext();
        // an analyser is used for the spectrum
        myAudioAnalyser = myAudioContext.createAnalyser();
        myAudioAnalyser.smoothingTimeConstant = 0.85;
        myAudioAnalyser.connect(myAudioContext.destination);

        fetchSounds();
    }
}

// ************************ DRAWING 
// @func drawSliders draws the highpass, pan and value sliders using D3      
function drawSliders(){
    d3.select("body").selectAll("#slider")
        .data([highpassValue, panValue, volumeValue])
        .enter();
    d3.select("body").selectAll("#slider")
        .style("width", function(d) { return d * 10 * 25 + "px"; })
        .text(function(d) { return d; });
}

// Initalizes the spectrum and draws a dummy empty spectrum 
function initSpectrum (){

    for (var i = 0;i<$('#spectrum').width()/7;i++){
        spectrum[i] = 1;
    }
    d3.select("#spectrum").selectAll("div")
        .data(spectrum)
        .enter()
        .append("div")
        .attr("id", "freq");
    d3.select("body").selectAll("#freq")
        .style("height", function(d) { return d + "px"; });
}


// @func drawSpectrum Draws the FFT spectrum of the audio signal
function drawSpectrum() {

    if (firstDraw == true){
    initSpectrum();
    firstDraw = false;        
    }
    var bar_width = 4;

    var freqByteData = new Uint8Array(myAudioAnalyser.frequencyBinCount);
    myAudioAnalyser.getByteFrequencyData(freqByteData);

    for (var i = 0; i < spectrum.length; i++) {
        var magnitude = freqByteData[i];
        // some values need adjusting to fit on the canvas
        // ctx.fillRect(bar_width * i, height, bar_width - 2, -magnitude + 60);
        spectrum[i] = magnitude*1.50;
    }

    d3.select("#spectrum").selectAll("div")
        .data(spectrum)
        .enter();
    d3.select("body").selectAll("#freq")
        .style("height", function(d) { return d + "px"; });

}


// ************************ AUDIO 
// @func fetchSounds fetches the files from the music directory
function fetchSounds() {
    var request = new XMLHttpRequest();
    for (var i = 0, len = SOUNDS.length; i < len; i++) {
        request = new XMLHttpRequest();
        request._soundName = SOUNDS[i];
        request.open('GET', PATH + request._soundName + '.mp3', true);
        request.responseType = 'arraybuffer';
        request.addEventListener('load', bufferSound, false);
        request.send();
    }
}

function bufferSound(event) {
    var request = event.target;
    var buffer = myAudioContext.createBuffer(request.response, false);
    myBuffers[request._soundName] = buffer;
}
 
function selectRandomBuffer() {
    var rand = Math.floor(Math.random() * SOUNDS.length);
    var soundName = SOUNDS[rand];
    return myBuffers[soundName];
}

function routeSound(source) {
    myNodes.filter = myAudioContext.createBiquadFilter();
    myNodes.panner = myAudioContext.createPanner();
    myNodes.volume = myAudioContext.createGainNode();
    // var compressor = myAudioContext.createDynamicsCompressor();
    // set node values to current slider values
    var highpass = document.querySelector('#highpass').value;
    var panX = document.querySelector('#pan').value;
    var volume = document.querySelector('#volume').value;

    myNodes.filter.type = 1; // highpass
    myNodes.filter.frequency.value = highpass;
    myNodes.panner.setPosition(panX, 0, 0);
    myNodes.volume.gain.value = volume;

    // pass source through series of nodes
    source.connect(myNodes.filter);
    myNodes.filter.connect(myNodes.panner);
    myNodes.panner.connect(myNodes.volume);
    myNodes.volume.connect(myAudioAnalyser);

    return source;
}

// @func playSound Plays the given song
function playSound() {
    // create a new AudioBufferSourceNode
    var source = myAudioContext.createBufferSource();
    source.buffer = selectRandomBuffer();
    source.loop = true;
    source = routeSound(source);
    // play right now (0 seconds from now)
    // can also pass myAudioContext.currentTime
    source.noteOn(0);
    mySpectrum = setInterval(drawSpectrum, 30);
    mySource = source;
}

// @func playSound Pauses the given song
function pauseSound() {
    var source = mySource;
    source.noteOff(0);
    clearInterval(mySpectrum);
}

// @func playSound Pauses the song if first trigger 
// or plays a random song if second
function toggleSound(button) {
    if(!isPlaying) {
        playSound();
        button.value = "Pause sound";
        isPlaying = true;
    }
    else {
        pauseSound();
        button.value = "Play random sound";
        isPlaying = false;
    }
}


function sliderChange(slider) {
    if(myAudioContext.activeSourceCount > 0) {
        if(slider.id == 'highpass') {
            var highpass = slider.value;
            myNodes.filter.frequency.value = highpass;
        }
        else if(slider.id == 'pan') {
            var panX = slider.value;
            myNodes.panner.setPosition(panX, 0, 0);
        }
        else if(slider.id == 'volume') {
            var volume = slider.value;
            myNodes.volume.gain.value = volume;
        }
    }
    highpassValue=highpass;
    panValue = panX;
    volumeValue = volume;
    drawSliders();
}
      

(function(){
    init();
    initSpectrum();
})();