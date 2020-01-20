'use strict';
const Message = require('./protobuf/message_pb').Message;
const Express = require('express');
const Http = require('http');
const WebSocket = require('ws');
const FileSystem = require('fs');
const app = Express();
const Firebase = require('firebase-admin')
const uuid = require('uuid/v1')

const FCMPublicTopic = 'public';

Firebase.initializeApp({
    credential: Firebase.credential.applicationDefault(),
    databaseURL: 'https://chatnel-766ef.firebaseio.com'
});

app.use(function (req, res) {
    res.send({ msg: 'hello' });
});

const server = Http.createServer(app);

const wss = new WebSocket.Server({ server })
wss.on('connection', function connection(socket) {
    console.log(`new connection: ${socket.url}`)
    socket.on('message', function incoming(bytes) {
        const message = Message.deserializeBinary(bytes);
        const type = message.getType();

        console.log(`${message.getType()}, ${message.getOwner()}, ${message.getContent()}, ${message.getUid()}`)

        if(typeof this.mapping == 'undefined'){
            this.mapping = new Map()
                .set('chat/plainText', (message) => {
                    message.setGuid(uuid());

                    const notificationMessage = {
                        data: {
                            owner: message.getOwner(),
                            content: message.getContent(),
                            type: message.getType(),
                            uid: message.getUid(),
                            guid: message.getGuid()
                        },
                        topic: FCMPublicTopic
                    };

                    Firebase.messaging().send(notificationMessage)
                        .then((response) => {
                            console.log('Successfully sent message:', response);
                        })
                        .then((error) => {
                            console.log('Error sending notification:', error);
                        });
                    
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
