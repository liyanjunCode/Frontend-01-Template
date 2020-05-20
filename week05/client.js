const net = require('net')
const {parseHtml} = require('../week06/parse-html.js')
class Request {
    constructor(options) {
        this.host = options.host;
        this.port = options.port || '';
        this.method = options.method || 'GET'
        this.path = options.path || '';
        this.header = options.header || {};
        this.data = options.data || {};
        this.body = null
        if(this.header['Content-Type'] === 'application/x-www-form-urlencoded') {
            this.body = Object.keys(this.data).map(key => `${key}:${encodeURI(this.data[key])}`).join('&')
        } else if(this.header['Content-Type'] === 'application/json') {
            this.body = JSON.stringify(this.body)
        }
        this.header['content-length'] = this.body.length;
    }
    toString() {
        return `${this.method} / HTTP/1.1\r\nHost: ${this.host}\r\n${Object.keys(this.header).map(key => `${key}:${this.header[key]}`).join('\r\n')}\r\n\r\n${this.body}\r\n`
    }
    send(connection) {
        return new Promise((resolve, reject) => {
            if(connection) {
                connection.write(this.toString())
            }else {
                let data;
                const connection = net.createConnection({
                    port: this.port,
                    host: this.host,
                }, () => {
                    connection.write(this.toString())
                    const resPase = new ParseResponse()
                    connection.on('data', (chunk) => {
                        data = resPase.receveChar(chunk.toString())
                        if(resPase.finished) {
                            connection.end()
                        }
                    })
                    connection.on('end', () => {
                        resolve(resPase.bodyvalue)
                    })
                    connection.on('error', (err) => {
                        console.log(err)
                    })
                })
            }
        })
    }
}

class Response {

}
class ParseResponse{
    constructor() {
        this.STATUS_LINE_START = 0;
        this.STATUS_LINE_END = 1;
        this.HEAD_LINE_NAME = 2;
        this.HEAD_LINE_NAME_END = 3;
        this.HEAD_LINE_SPACE = 4;
        this.HEAD_LINE_VALUE_START=5;
        this.HEAD_LINE_VALUE_END = 6;
        this.CHUNK_BLOCK_START = 7;
        this.CHUNK_BLOCK_END = 8;
        this.BODY_PARSE_START = 9;
        this.current = this.STATUS_LINE_START;
        this.statusCode = 0;
        this.statusText = '';
        this.headers = {};
        this.headerName ='';
        this.headerValue = '';
        this.body = '';
        this.chars = ''
    }
    get finished() {
        return this.parseBody && this.parseBody.finished
    }
    get bodyvalue() {
        /HTTP\/1.1 ([0-9]+) ([\s\S]+)/.test(this.statusText)
        return {
            statusCode: RegExp.$1,
            statusText: RegExp.$2,
            header: this.headers,
            body: this.body
        }
    }
    receveChar(chunk) {
        for(let i=0; i<chunk.length; i++) {
            const char = chunk[i];
            if(this.current === this.STATUS_LINE_START) {
                if(char === '\r') {
                    this.current = this.STATUS_LINE_END
                    this.statusText = this.chars;
                    this.chars = ''
                } else {
                    this.chars += char
                }
            } else if(this.current == this.STATUS_LINE_END) {
                if(char === '\n'){
                    this.current = this.HEAD_LINE_NAME
                }
            } else if(this.current == this.HEAD_LINE_NAME) {
                if(char === ':') {
                    this.current = this.HEAD_LINE_SPACE
                    this.headerName = this.chars;
                    this.chars = '';
                }else if(char === '\r') {
                    this.current = this.HEAD_LINE_NAME_END
                }else {
                    this.chars += char;
                }
            } else if(this.current == this.HEAD_LINE_NAME_END){
                if(char === '\n') {
                    this.current = this.BODY_PARSE_START
                    this.parseBody = new ChunksBodyParse()
                }
            } else if(this.current == this.HEAD_LINE_SPACE) {
                if(char == ' ') {
                    this.current = this.HEAD_LINE_VALUE_START
                }
            } else if(this.current == this.HEAD_LINE_VALUE_START) {
                if(char == '\r'){
                    this.current = this.HEAD_LINE_VALUE_END
                    this.headerValue = this.chars;
                    this.chars = '';
                } else {
                    this.chars += char;
                }
            } else if(this.current == this.HEAD_LINE_VALUE_END) {
                if(char == '\n'){
                    this.current = this.HEAD_LINE_NAME
                    this.headers[this.headerName] = this.headerValue
                    this.headerName ='';
                    this.headerValue = ''
                }
            } else if( this.current == this.BODY_PARSE_START) {
                this.parseBody.receveChar(char)
                if(this.parseBody.finished) {
                    this.body = this.parseBody.body
                }
            }
            // else if(this.current == this.CHUNK_BLOCK_START) {
            //     console.log(char === '\r', char === '\n')
            //     if(char === '\r') {
            //         this.current = this.CHUNK_BLOCK_END
            //         console.log(this.headerValue , 'this.headerValue', str)
            //     } else {
            //         console.log(this.headerValue , 'this.headerValue1', str)
            //     }
            // } else if( this.current == this.CHUNK_BLOCK_END) {
            //     if(char == '\n') {
            //         this.current = this.BODY_PARSE_START
            //     }
            // }          
        }   
        return {
            'status-line': this.statusText,
            header: this.headers,
            body: this.body
        }
    }
}
class ChunksBodyParse {
    constructor() {
        this.TEXT_LENGTH_START = 0;
        this.TEXT_LENGTH_END = 1;
        this.BODY_TEXT_START = 2;
        this.BODY_TEXT_END = 3;
        this.current = this.TEXT_LENGTH_START;
        // this.body = '';
        this.len = 0;
        this.token = []
        this.finished = false
    }
    get body() {
        return this.token.join('')
    }
    receveChar(char){
        if(this.current == this.TEXT_LENGTH_START) {
            if(char == '\r') {
                this.current = this.TEXT_LENGTH_END
            } else {
                this.len *= 16;
                this.len += parseInt(char, 16);
            }
        } else if(this.current == this.TEXT_LENGTH_END) {
            if(char === '\n'){
                if(this.len === 0) {
                    this.finished = true
                }
                this.current = this.BODY_TEXT_START
            }
        }else if( this.current == this.BODY_TEXT_START) {
            if(char == '\r') {
                this.current = this.BODY_TEXT_END
            }else {
                this.token.push(char)
                // this.body += char
            }
        } else if(this.current == this.BODY_TEXT_END) {
            this.current = this.TEXT_LENGTH_START
            this.len = 0;
        }   
    }
}
void async function(){
    const request = new Request({
        port: 8088,
        host: '127.0.0.1',
        header: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: {
            field1:'aaa',
            code:'bbb'
        }
    })
    const res = await request.send()
    parseHtml(res.body)
}()