// var https = require('https');
const express = require('express');
// var fs = require('fs');
const app = express();

// var options = {
//     key: fs.readFileSync('certificates/alice.key'),
//     cert: fs.readFileSync('certificates/alice.crt'),
//     requestCert: false,
//     rejectUnauthorized: false
// };

// This serves static files from the specified directory
app.use(express.static(__dirname + '/build'));

app.get(['/', '/index.html'], (req, res) => {
    res.sendFile('build/index.html');
});

const server = app.listen(8000, () => {
    const host = server.address().address;
    const port = server.address().port;
    
    console.log('App listening at http://localhost:%s', port);
});


// var server = https.createServer(options, app).listen(8000, function(){
//     const host = server.address().address;
//     const port = server.address().port;

//     console.log("server started at https://localhost:%s", port);
// });