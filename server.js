const http = require('http');
const fs = require('fs');
const url = require('url');

const port = 8080;

function sendFile(res, filename, contentType) {
  contentType = contentType || 'text/html';

  fs.readFile(filename, (error, content) => {
    res.writeHead(200, { 'Content-type': contentType });
    res.end(content, 'utf-8');
  });
}

const server = http.createServer((req, res) => {
  const uri = url.parse(req.url);
  if (uri.pathname.includes('assets')) {
    let path = uri.pathname;
    if (path.length > 0 && path[0] === '/') {
      path = path.substr(1);
    }
    console.log(path);
    sendFile(res, path);
  } else {
    console.log('/');
    sendFile(res, 'index.html');
  }
});

server.listen(process.env.PORT || port);
console.log('listening on 8080');
