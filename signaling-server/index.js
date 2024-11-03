const express = require('express');
const https = require('https');
const fs = require('fs');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors(
    {
        origin: '*'
    }
));
const options = {
    key: fs.readFileSync('./certs/localhost-key.pem'),
    cert: fs.readFileSync('./certs/localhost.pem')
};
const server = https.createServer(options, app);
const io = new Server(server, {
    cors: {
        origin: '*',
    }
});
const port = 4000;

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('offer', (data) => {
        console.log('offer', socket.id);
        socket.broadcast.emit('offer', data);
    });
    socket.on('answer', (data) => {
        console.log('answer', socket.id);
        socket.broadcast.emit('answer', data);
    });
    socket.on('candidate', (data) => {
        console.log('candidate', socket.id);
        socket.broadcast.emit('candidate', data);
    });
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

app.get('/ping', (req, res) => {
    res.send('pong');
});

server.listen(port, () => {
    console.log(`Server running on https://localhost:${port}`);
});
