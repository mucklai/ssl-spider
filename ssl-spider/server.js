var ssllabs = require('node-ssllabs');
var https = require('https');
var file = 'public/top-1m.csv';
var port = 8080;
var url = {
	name: null,
	valid_to: null,
	cipher: null,
	grade: null,
	ssl: true
}
var EXPIRING = 0;
var STABLE = 1;
var NO_SSL = 2;
var SHA1 = 3;

var pause = false;
var names = [];
var reading_complete = false;

var time = new Date();
rl = require('readline').createInterface({
	input: require('fs').createReadStream(file)
});

rl.on('line', function (line) {
	names.push(line.split(',')[1]);
});

rl.on('close', function (line) {
	reading_complete = true;
	console.log((new Date()) - time);
});

function scan_urls(url_array, stable_array, expiring_array, no_ssl_array, sha1_array, i, j, date, rl) {
	if (!reading_complete){
		setInterval(scan_urls(url_array, stable_array, expiring_array, no_ssl_array, sha1_array, i, j, date, rl), 1000);
		return;
	}
	
	while (i < names.length) {
		check_ssl(names[i]);
		i++;
	}

	function check_ssl(target) {
		var new_url = Object.create(url);
		new_url.name = target;
		var options = {
		    host: target,
		    port: 443,
		    method: 'GET'
		};
		https.request(options, function(res) {
			new_url.valid_to = res.connection.getPeerCertificate().valid_to;
			new_url.cipher = res.connection.getCipher().name;
			url_array.push(new_url);
			if (true) {
				//if cipher is sha1
				sha1_array.push(new_url);
			}
			if (date >= (new Date(new_url.valid_to))) {
				//if within date
				expiring_array.push(new_url);
				//console.log("Expiring: " + new_url.valid_to);
			} else {
				//if outside range
				stable_array.push(new_url);
			}
			j++;
		}).on('error', function(e) {
			new_url.ssl = false;
			url_array.push(new_url);
			no_ssl_array.push(new_url);
			j++;
			return;
		}).end();

		ssllabs.scan(target, function (err, host) {
		    if (err || !(host.endpoints)) {
			    return;
			}
			host.endpoints.forEach(function (endpoint) {
			    new_url.grade = endpoint.grade;
			});
		});
	}
}

var express = require('express')
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(port);
console.log("Listening");
app.use(express.static('public'));

io.on('connection', function (socket) {
	console.log("Connection");
	socket.url_array = [];
	socket.stable_array = [];
	socket.expiring_array = [];
	socket.no_ssl_array = [];
	socket.sha1_array = [];
	socket.i = 0;
	socket.j = 0;
	socket.rl = null;

	socket.emit('initialize');

	socket.on('start', function (data) {
		date = new Date(data);
		scan_urls(socket.url_array, socket.stable_array, socket.expiring_array, socket.no_ssl_array, socket.sha1_array, socket.i, socket.j, date, socket.rl);
	});

	socket.on('update_me', function (data) {
		// data has attributes type (of url), page
		var urls_to_send = null;
		data = JSON.parse(data);
		var first = data.page * 20;
		switch (data.type) {
			case EXPIRING:
				var last = Math.min((data.page + 1) * 20, socket.expiring_array.length);
				urls_to_send = socket.expiring_array.slice( first, last );
				break;
			case STABLE:
				var last = Math.min((data.page + 1) * 20, socket.stable_array.length);
				urls_to_send = socket.stable_array.slice( first, last );
				break;
			case NO_SSL:
				var last = Math.min((data.page + 1) * 20, socket.no_ssl_array.length);
				urls_to_send = socket.no_ssl_array.slice( first, last );
				break;
			case SHA1:
				var last = Math.min((data.page + 1) * 20, socket.sha1_array.length);
				urls_to_send = socket.sha1_array.slice( first, last );
				break;
		}
		var return_data = {
			urls_to_send: urls_to_send,
			num_total: socket.url_array.length,
			num_expired: socket.expiring_array.length,
			num_stable: socket.stable_array.length,
			num_sha1: socket.sha1_array.length
		};
		return_data = JSON.stringify(return_data);
		socket.emit('update', return_data);;
	});

	socket.on('url', function(data){
		//data has attribute name (of url)
		var found = false;
		data = JSON.parse(data);
		for (var a = 0; a < url_array.length; a++) {
			if (url_array[a].name == data.name) {
				found = true;
				var return_data = JSON.stringify(url_array[a]);
				socket.emit('url', return_data);
				break;
			}
		}
		if (!found) {
			socket.emit('not_found');
		}
	});

	socket.on('pause', function(){
		if (rl) {
			rl.pause();
		}
		console.log("paused");
	});

	socket.on('resume', function(){
		if (rl) {
			rl.resume();
		}
		console.log("resumed");
	});
});