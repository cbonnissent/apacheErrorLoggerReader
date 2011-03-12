var io = require('socket.io');
var http = require('http');
fs = require('fs');

server = http.createServer(function (req, res) {});
server.listen(8080);

var socket = io.listen(server);

var regAnalyze = new RegExp('\\[([^\\]]*)\\] \\[([^\\]]*)\\] \\[([^\\]]*)\\] (.*)');
var regReferer = new RegExp(', referer: (.*)');
var currSize = 0;
var currentlyReading = false;
var reads = [];

String.prototype.ltrim = function() {
    return this.replace(/^\n+/,"");
}

function openAndAnalyzeFile(err, file) {
    if (currentlyReading) {
        openAndAnalyzeFile(err, file);
    } else {
        currentlyReading = true;
        currentSize = reads.shift();
        var currentBuffer = new Buffer(currentSize.maximus - currentSize.minus);
        fs.readSync(file, currentBuffer, 0, currentSize.maximus - currentSize.minus, currentSize.minus - 1);
        if (err) {
            throw err;
        }
        lineContent = currentBuffer.toString('utf8');
        lineElement = lineContent.ltrim().split("\n");
        for (var i=0; i < lineElement.length; i++) {
            currentElement = lineElement[i];
            analyze = regAnalyze(currentElement);
            referer = regReferer(currentElement);
            result = {};
            if (analyze !== null) {
                result.date = analyze[1];
                result.level = analyze[2];
                result.client = analyze[3];
                result.content = analyze[4];
            } else {
                result.date = "unknown";
                result.level = "unknown";
                result.client = "unknown";
                result.content = currentElement;
            }
            if (referer !== null) {
                result.referer = referer[1];
                hasReferer = true;
            } else {
                result.referer = "unknown";
            }
            if (hasReferer) {
                result.content = result.content.replace(regReferer, "");
            }
            resultJSON = JSON.stringify(result);
            console.log(resultJSON);
            socket.broadcast(resultJSON);
            currentlyReading = false;
        }
    }
}

fs.watchFile('/var/log/apache2/error.log', function (curr, prev) {
    var prevSize =0;
    if (currSize === 0) {
        prevSize = prev.size;
    }
    else {
        prevSize = currSize;
    }
    currSize = curr.size;
    var size = {};
    size.minus = prevSize;
    size.maximus = currSize;
    console.log('Size '+size.minus+' '+size.maximus);
    reads.push(size);
    fs.open('/var/log/apache2/error.log', 'r', openAndAnalyzeFile);
});
