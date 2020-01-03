const server = require('http').createServer();
const io = require('socket.io')(server);

io.on('connection', client => {
    console.log(`connect ${client.id}`);
    client.on('disconnect', () => {
        console.log(`disconnect ${client.id}`);
    });
});

server.listen(5000, () => {
    console.log('Server is listen');
});

exports.server = server;