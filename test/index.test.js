const should = require('should');
const ws = require('ws');
const Message = require('../src/protobuf/message_pb').Message;

const socketURL = "wss://localhost:5000";
const options = {
    origin: 'https://localhost:5000'
};

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

describe('Server', () => {
    let server;
    before('Setting server', done => {
        server = require('../src/index').server;
        server.close();
        done();
    });

    beforeEach('Start server', done => {
        server.listen(5000, function listening() {
            done();
        });
    });

    afterEach('Close server', done => {
        server.close((err) => {
            done();
        });
    });

    describe('Socket', () => {
        it('Should connectable', (done) => {
            const socket = new ws(socketURL, options);
            socket.on('open', () => {
                socket.close();
                done();
            });
        });
    });

    describe('message', () => {
        it('should broadcast message', (done) => {
            const owner = 'unittest-owner';
            const content = 'unittest-content';
            const type = 'chat/plainText';
            
            const client = new ws(socketURL, options);
            client.on('message', (data, flags) => {
                const message = Message.deserializeBinary(data);
                message.getOwner().should.equal(owner);
                message.getContent().should.equal(content);
                message.getType().should.equal(type);
                
                client.close();
                
                done();
            });
            client.on('open', () => {
                const message = new Message();
                message.setOwner(owner);
                message.setContent(content);
                message.setType(type);
                
                const bytes = message.serializeBinary();
                
                client.send(bytes);
            });
        });
    });
});