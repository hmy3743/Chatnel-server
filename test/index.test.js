const should = require('should');
const client = require('socket.io-client');

const socketURL = "http://localhost:5000";
const options = {
    transports: ['websocket'],
    'force new connection': true
};

describe('Server', () => {
    let server;
    beforeEach('Start server', done => {
        server = require('../src/index').server;
        done();
    });

    afterEach('Close server', done => {
        server.close();
        done();
    });

    describe('Socket', () => {
        it('Should connectable', (done) => {
            const socket = client.connect(socketURL, options);
            socket.on('connect', () => {
                done();
                socket.close();
            });
        });
    });
});