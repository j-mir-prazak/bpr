let spawn = require('child_process').spawn;
let EventEmitter = require('events');
let StringDecoder = require('string_decoder').StringDecoder

var decoder = new StringDecoder('utf-8')

let args = new Array(

	"-o",
	"local",
	"assets/01 Honey.flac"
)

console.log(args)

var omxProcess = spawn('/usr/bin/omxplayer.bin', args, {detached: false, stdio: [ 'pipe', 1, 2 ]});

omxProcess.stdout.on('data', (data) => {
	// var decoder = new StringDecoder('utf-8')
	console.log(data.toString())
	var string = decoder.write(data)
	string=string.split(/\r?\n/)
	for( var i = 0; i < string.length; i++) {
		// console.log(string[i])
		// if ( string[i].match(/Current volume:/ )) {
		// 	var vol = string[i].replace(/Current volume: (.*)dB/i,"$1")
		// 	vol = parseFloat(vol)
		// 	console.log(vol)
		}
});

omxProcess.stderr.on('data', (data) => {
	console.log(data)
	// var decoder = new StringDecoder('utf-8')
	var string = decoder.write(data)
	string=string.split(/\r?\n/)
	for( var i = 0; i < string.length; i++) {
		// console.log(string[i])
		// if ( string[i].match(/Current volume:/ )) {
		// 	var vol = string[i].replace(/Current volume: (.*)dB/i,"$1")
		// 	vol = parseFloat(vol)
		// 	console.log(vol)
		}
});
