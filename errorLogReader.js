var io = require('socket.io');
var http = require('http');
fs = require('fs');

server = http.createServer(function (req, res) {});
server.listen(8080);

var socket = io.listen(server);

var regDate = new RegExp('\\[([^\\]]*)\\]');
var regReferer = new RegExp(', referer: (.*)');
var content = new RegExp();

fs.watchFile('/var/log/apache2/error.log', function (curr, prev) {
    var currentFileBuffer = new Buffer(curr.size - prev.size);
    file = fs.openSync('/var/log/apache2/error.log', 'r');
    fs.read(file, currentFileBuffer, 0, curr.size - prev.size, prev.size - 1, function (err, bytesRead) {
        if (err) {
            throw err;
        }
        lineContent = currentFileBuffer.toString('utf8');
        date = regDate(lineContent);
        referer = regReferer(lineContent);
        result = {};
        if (date !== null) {
            result.date = date[1];
            hasDate = true;
        } else {
            result.date = "unknown";
        }
        if (referer !== null) {
            result.referer = referer[1];
            hasReferer = true;
        } else {
            result.referer = "unknown";
        }
        result.content = lineContent.replace('(\\\\n)', '</br>');
        resultJSON = JSON.stringify(result);
        socket.broadcast(resultJSON);
    });
});
