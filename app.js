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
          responce.statusCode = 200;
          console.log('The file has been saved!');
          responce.end()
        });
    });
  }

  if (request.url === '/delete-file' && request.method === 'POST') {
    let data = '';
    request.on('data', (chunk) => {
        data += chunk;
    })

    request.on('end', () => {
        fs.unlink('./images/' + data, (err) => {
            if (err) console.error(err)
            else console.log('./images/' + data, 'has been removed!');
        })
    })
  }
  
}).listen(3000, () => console.log('Сервер запущен: http://localhost:3000/index.html'));
