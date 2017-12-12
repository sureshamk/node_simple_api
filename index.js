var http = require('http');
var router = require('./router');
var config = require('./config.json')


var port = config.app.port;
var ip =config.app.host;

var server = http.createServer(router.handleRequest);
console.log("Listening on http://" + ip + ":" + port);

server.listen(port, ip);

