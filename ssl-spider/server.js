var https = require('https');
var options = {
    host: 'google.com',
    port: 443,
    method: 'GET'
};

var req = https.request(options, function(res) {
    console.log(res.connection.getPeerCertificate());
});

req.end();