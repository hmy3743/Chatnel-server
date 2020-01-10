'use strict';
const Message = require('./protobuf/message_pb').Message;
const Express = require('express');
const Http = require('http');
const WebSocket = require('ws');
const FileSystem = require('fs');
const app = Express();

app.use(function (req, res) {
    res.send({ msg: 'hello' });
});

const server = Http.createServer(app);

const wss = new WebSocket.Server({ server })
wss.on('connection', function connection(socket) {
    socket.on('message', function incoming(bytes) {
        const message = Message.deserializeBinary(bytes);
        const type = message.getType();

        console.log(`${message.getType()}, ${message.getOwner()}, ${message.getContent()}`)

        if(typeof this.mapping == 'undefined'){
            this.mapping = new Map()
                .set('chat/plainText', (message) => {
                    const bytes = message.serializeBinary();
                    wss.clients.forEach((item) => {
                        item.send(bytes);
                    });
                });
        }

        this.mapping.get(type)(message);
    });
});
server.listen(5000, function listening() {
    console.log('Listening on %d', server.address().port);
});
exports.server = server;
