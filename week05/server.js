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
        body .parent{
            display: flex;
        }
        .parent .item1{
            width: 20px;
            background: yellow;
        }
        .parent .item2{
            width: 40px;
            background: red;
        }
        .parent .item3{
            width: 80px;
            background: blue;
        }
        .parent .item4{
            flex:1;
        }
    </style>
    </head>
    <body>
        <div class="parent">
        29389
            <div class="item1">1</div>
            <div class="item2">2</div>
            <div class="item3">3</div>
            <div class="item4">4</div>
        </div>
    </body>
    </html>`);
})

server.listen(8088)