#!/usr/bin/node
const spawner = require('child_process');


function connection_check() {
	return spawner.spawnSync('bash', ['-c', './connection_check.sh']).status

}




function setupHandler(asset) {
	lock = true
	if ( connection_check() == 1 ) {
		console.log("waiting")
		setTimeout(function(asset) {
			setupHandler(asset)
		}.bind(null,asset), 1000)
	}
	else {
		console.log(asset)
	}
}

setupHandler("abc")

console.log("bam")
