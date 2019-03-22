let spawn = require('child_process').spawn;
let EventEmitter = require('events');
let StringDecoder = require('string_decoder').StringDecoder

let decoder = new StringDecoder('utf-8')

let args = {
	"-o", "local", "assets/01 Honey.flac", "<input.pipe"

}
let omxProcess = spawn('/usr/bin/omxplayer.bin', args, {detached: true});

omxProcess.stdout.on('data', (data) => {
	var decoder = new StringDecoder('utf-8')
	var string = decoder.write(data)
	string=string.split(/\r?\n/)
	for( var i = 0; i < string.length; i++) {
		console.log(string[i])
		if ( string[i].match(/Current volume:/ )) {
			var vol = string[i].replace(/Current volume: (.*)dB/i,"$1")
			vol = parseFloat(vol)
			console.log(vol)
		}
	}
});
