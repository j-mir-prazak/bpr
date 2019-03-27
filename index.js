//modules declaration
var spawner = require('child_process')
var StringDecoder = require('string_decoder').StringDecoder
var events = require('events')
var fs = require('fs')
var schedule = require('node-schedule')
var omx = require('node-omxplayer')


//clean up
process.on('SIGHUP',  function(){ console.log('\nCLOSING: [SIGHUP]'); process.emit("SIGINT"); })
process.on('SIGINT',  function(){
	 console.log('\nCLOSING: [SIGINT]');
	 for (var i = 0; i < pids.length; i++) {
		console.log("KILLING: " + pids[i])
		process.kill(-pids[i])
 	}
	 process.exit(0);
 })
process.on('SIGQUIT', function(){ console.log('\nCLOSING: [SIGQUIT]'); process.emit("SIGINT"); })
process.on('SIGABRT', function(){ console.log('\nCLOSING: [SIGABRT]'); process.emit("SIGINT"); })
process.on('SIGTERM', function(){ console.log('\nCLOSING: [SIGTERM]'); process.emit("SIGINT"); })

var pids = new Array();

function cleanPID(pid) {
	var pid = pid || false
	for (var i = 0; i < pids.length; i++) {
		if ( pids[i] == pid ) {
			pids.splice(i, 1)
			console.log("PID"+pid+" deleted")
		}
	}
}


var assets;
assets = fs.readdirSync('assets')

// fs.readdir('./assets', function(err, items) {
//
//     for (var i=0; i<items.length; i++) {
// 			assets.push(items[i])
//     }
//
// 		for (var i=0; i<assets.length; i++) {
// 			console.log(assets[i]);
// 			fs.stat(assets[i], function(err, stats) {
// 				console.log(stats);
// 			});
// 		}
//
// });


console.log(Date.now())
var buttons_pressed = {
	"button0":0,
	"button1":0,
	"button2":0
}



function buttonPressed(button, now) {
	var button = button || false
	if (! button ) return false
	var now = now || Date.now()
	if ( now - buttons_pressed["button1"] > 1000 && now - buttons_pressed[button] > 500 )
		{
			buttons_pressed[button] = now
			console.log(button + ": pressed")
			if (button == "button1") {
				console.log("changeButton")
				changeAsset()
			}
			else if (button == "button0") {
				console.log("volumeDownButton")
				volume("down")
			}
			else if (button == "button2") {
				console.log("volumeUpButton")
				volume("up")
			}
		}

}

var current_volume = -4200

function volume(dir) {
	var dir = dir || false

	if ( ! dir ) return false

	if( ! player["player"] || ! player["player"].open == true ) return false

	else if ( dir == "up" ) player["player"].volUp()
	else if ( dir == "down" ) player["player"].volDown()
}

var current_asset = 0
var player = {}
var lock = false

function setupPlayer(asset) {

	var asset = asset
	if ( asset === false ) return false

	lock = false

	player["player"] = omx('assets/' + assets[asset], "local", false, current_volume)
	var pid = player["player"].pid
	pids.push(pid)
	console.log(player["player"].pid)

	if ( player["player"].process ) {

		player["player"].process.stdout.on('data', (data) => {
			var decoder = new StringDecoder('utf-8')
			var string = decoder.write(data)
			string=string.split(/\r?\n/)
			for( var i = 0; i < string.length; i++) {
				if (string[i].length > 0 && string[i].match(/Current Volume/) ) {
					var vol = string[i].replace(/Current Volume: (.*)dB/i,"$1")
					vol = parseFloat(vol) * 100
					current_volume = vol
					console.log("Current volume: " + current_volume)
				}
			}
		});

		player["player"].process.stderr.on('data', (data) => {
			var decoder = new StringDecoder('utf-8')
			var string = decoder.write(data)
			string=string.split(/\r?\n/)
			for( var i = 0; i < string.length; i++) {
			 if (string[i].length > 0 )	console.log(string[i])
			}
		});

	}

	player["player"].on('close', function(pid) {

		console.log("playback ended")
		cleanPID(pid)
		setupHandler(current_asset)
	}.bind(null, pid))

}

function cycleAssets() {
		current_asset++
		current_asset = current_asset % assets.length
		return current_asset

}

function changeAsset() {
		if ( lock == true ) return false
		console.log("changeAsset")
		var asset = cycleAssets()
		lock = true
		if( player["player"] && player["player"].open == true ) player["player"].quit()
		else setupHandler(asset)

}

function setupHandler(asset) {
	lock = true
	if ( connection_check() == 1 ) {
		console.log("no internet connection. waiting.")
		setTimeout(function(asset) {
			setupHandler(asset)
		}.bind(null,asset), 1000)
	}
	else {
		console.log("internet connection. playing.")
		setupPlayer(asset)
	}
}

changeAsset()


function py() {
	var py = spawner.spawn("bash", new Array("-c", "./fake_buttons.py"), {detached: true})
	var decoder = new StringDecoder('utf-8')

	pids.push(py["pid"])

	py.stdout.on('data', (data) => {
	  var string = decoder.write(data)
		string=string.split(/\r?\n/)
		for( var i = 0; i < string.length; i++) {
			if ( string[i].length > 0 && string[i].match(/^system:connected/) ) {
				console.log("reading buttons")
			}
			else if ( string[i].length > 0 && string[i].match(/^system:buttons:/) ) {
				console.log("buttons connected: " + string[i].replace(/^system:buttons:/, ""))
			}
			else if ( string[i].length > 0 && string[i].match(/^buttons:/) ) {
				// console.log(string[i])
				var combination = string[i].replace(/^buttons:/, "").split(":")
				var button0 = combination[0]
				var button1 = combination[1]
				var button2 = combination[2]
				var now = Date.now()
				// console.log("__________________")
				if ( button0 == 1 ) buttonPressed("button0", now)
				if ( button1 == 1 ) buttonPressed("button1", now)
				if ( button2 == 1 ) buttonPressed("button2", now)

			}
		}
	});
	//not final state!
	py.stderr.on('data', (data) => {
	  // console.log(`stderr: ${data}`)
	  // var string = decoder.write(data)
		// string = string.replace(/\r?\n$/, "")
		// if ( string.match(/^ls: cannot access/)) console.log(search + " not found")
		// return false
	});
	py.on('close', function (pid, code) {
		cleanPID(pid)
		if (code == 0) {
			for ( i in ttys ) {
				if ( ! ttys[i]["catstarted"] ) {
					console.log(ttys[i])
					cat(ttys[i])
				}
				else "nothing to cat"
			}
		}
		else {
			console.log(' not to be found')
		}
	}.bind(null, py["pid"]));
	return py;
}

py();





//global vars
var date
// date = new Date()
// var obj = JSON.parse(fs.readFileSync('schedule.json', 'utf8'))
// var sch = obj.schedule
var obj
var sch

function startCycle() {

	console.log("------------------  n e w  c y c l e  ------------------")
	console.log(""+new Date())

	var cycle = new Array();

	var filename = "mk.mkv"
	// if ( media ) cycle["player"] = omx('/media/pi/'+ media + '/' + filename, 'alsa')
	// else cycle["player"] = omx('assets/' + filename, 'alsa')
	cycle["player"] = omx('assets/' + filename, 'alsa')
	pids.push(cycle["player"].pid)
	return cycle

}

var queueRunning = false
var playerQueue = new Array()

function queueHandler() {
	if ( playerQueue.length == 0 ) {
		queueRunning = false
		return true
	}
	queueRunning = true
	var value = playerQueue.shift()
	var entry = value()
	if ( typeof entry == 'object') {
		var pid = entry.player.pid
		entry["player"].on('close', function (pid){
			console.log("PID"+pid + ' playback ended')
			cleanPID(pid)
			console.log("----------------  c y c l e  e n d e d  ----------------")
			setupJob()
			queueHandler()
			//bind pid number - player won't exist after closing, so you won't get the pid from the Object
		}.bind(null,pid))
	}
	queueHandler()
}

function numberPad(number, padding) {

	function recursePad(number, pad) {
		var pow = Math.pow(10, pad)
		if ( number >= pow ) {
			return pad
		}
		else return recursePad(number, pad-1)
	}

	var number = number
	var padding = padding-1
	var pads = recursePad(number, padding)
	var zeros = "0"
	zeros = zeros.repeat(padding-pads)
	return String(zeros + number)
}


function setupJob(){
	console.log("------------------  n e w  s e t u p  ------------------")
	obj = JSON.parse(fs.readFileSync('schedule.json', 'utf8'));
	sch = obj.schedule

	date = new Date()

	var day = sch[date.getDay()]

	var ohour = day.ohour
	var chour = day.chour

	console.log("the day is:\t" + numberPad(date.getDay()%7,2))
	console.log("first hour:\t" + numberPad(ohour,2))
	console.log("last hour:\t" + numberPad(chour,2))

	var job = openDay(date.getDay())

	console.log("job scheduled at: " + job)

	var j = schedule.scheduleJob(job, function(fireDate){
		console.log('new cycle enqueued')
		playerQueue.push(function() {
			return startCycle()
		})
		if ( queueRunning === false ) queueHandler()
	});
}


// function connection_check() {
// 	var cc = spawner.spawn("bash", new Array("-c", "./connection_check"), {detached: true})
// 	var decoder = new StringDecoder('utf-8')
//
// 	pids.push(cc["pid"])
//
// 	cc.on('close', function (pid, code) {
// 		cleanPID(pid)
// 		if (code == 0) {
// 			console.log("online")
// 		}
// 		else {
// 			console.log("offline")
// 		}
// 	}.bind(null, cc["pid"]));
// 	return cc;
// }

function connection_check() {
	return spawner.spawnSync('bash', ['-c', './connection_check.sh']).status
}
