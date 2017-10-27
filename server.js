const http = require('http');
const fs = require('fs');
const url = require('url');

const port = 8080;

function sendFile(res, filename, contentType) {
  contentType = contentType || 'text/html';

  fs.readFile(filename, (error, content) => {
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content, 'utf-8');
  });
}

const server = http.createServer((req, res) => {
  const uri = url.parse(req.url);
  if (uri.pathname.includes('assets')) {
    let path = uri.pathname;
    path = path.substr(path.indexOf('assets'));

    console.log(path);
    let mime = 'text';
    if (path.includes('.css')) {
      mime = 'text/css';
    } else if (path.includes('.js')) {
      mime = 'application/javascript';
    } else if (path.includes('.jpeg') || path.includes('.jpg')) {
      mime = 'image/jpeg';
    } else if (path.includes('.png')) {
      mime = 'image/png';
    }
    sendFile(res, path, mime);
  } else {
    console.log('/');
    sendFile(res, 'index.html');
  }
});

server.listen(process.env.PORT || port);
console.log('listening on 8080');
