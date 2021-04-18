const https = require('https');
const fs = require('fs');

const options = {
    key: fs.readFileSync('ChavesHTTPs/selfsigned.key'),
    cert: fs.readFileSync('ChavesHTTPs/selfsigned.crt')
};

https.createServer(options, function (req, res) {
    res.writeHead(200);
    res.end("hello world\n");
}).listen(8000);