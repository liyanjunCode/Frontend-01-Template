const http = require('http')

const server = http.createServer((req, res) => {
    console.log(req)
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('X-Foo', 'bar');
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(`	
    <html maaa="a" >
    <head>
    <style>
        body {
            width: 80px;
            display: flex;
            background-color: rgba(255, 255, 255)
        }
        .item1 {
            width: 50px;
            height: 30px;
            background: yellow;
        }
        .item2 {
            flex:1;
            height: 50px;
            background: red;
        }
    </style>
    </head>
    <body>
        <div class="item1">1</div>
        <div class="item2">2</div>
    </body>
    </html>`);
})

server.listen(8088)