const http = require('http');
const fs = require('fs');

http.createServer((request, responce) => {
  console.log(`Requested URL: ${request.url}`);
  const filePath = decodeURI(request.url).substring(1);
  fs.readFile(filePath, (error, data) => {
    if (error) {
      responce.statusCode = 404;
      responce.end;
    } else {
      responce.end(data);
    }
  });

  if (request.url === '/data' && request.method === 'POST') {
    let data = "";

    request.on('data', chunk => {
      data += chunk;
    });

    request.on('end', () => {
      fs.writeFile('data.json', data, () => {
        console.log('data modified');
      })
      responce.end('Данные успешно получены');
    })
  }


  if (request.url === '/file' && request.method === 'POST') {
    let body = '';
    request.on('data', chunk => {
      body += chunk;
    });

    request.on('end', () => {
      const {fileName, base64Image} = JSON.parse(body);
      const file = Buffer.from(base64Image, 'base64');
        fs.writeFile('./images/' + fileName, file, (err) => {
          if (err) throw err;
          console.log('The file has been saved!');
        });
    });
  }
  
}).listen(3000, () => console.log('Сервер запущен: http://localhost:3000/index.html'));
