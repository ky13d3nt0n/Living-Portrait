
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *
 * Server
 *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

var express = require('express');
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.use(express.static('assets'))

server.listen(8081);
// WARNING: app.listen(80) will NOT work here!

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
  console.log('Server running on port 8080')
});

io.on('connection', function (socket) {
  console.log('Server Connected')
});


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *
 * Motion
 *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

// Configure johnny-five
var five = require('johnny-five');
var board = new five.Board();

	board.on("ready",function() {
		var led = new five.Led(13);
		var motion = new five.Motion(4);

		// "calibrated" occurs once, at the beginning of a session,
		motion.on("calibrated", function() {
			console.log("Motion Calibrated");
			led.blink();

      // Emit to Client
      io.emit('motionCalibrated');
		});

		// "motionstart" events are fired when the "calibrated"
		// proximal area is disrupted, generally by some form of movement
		motion.on("motionstart", function() {
			console.log("Motion Start");
			led.stop();
			led.on();

      // Emit to Client
      io.emit('motionStart');
		});

		// "motionend" events are fired following a "motionstart" event
		// when no movement has occurred in X ms
		motion.on("motionend", function() {
			console.log("Motion End");
			led.stop();
			led.off();
		});
	});
