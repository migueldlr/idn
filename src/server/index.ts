import * as express from 'express';
import * as socketio from 'socket.io';
import path = require('path');

import Player from '../player';

const app = express();
const server = require('http').Server(app);

const io = require('socket.io').listen(server);

const players: Record<string, Player> = {};

// app.set('port', process.env.PORT || 8080);
app.use(express.static('dist'));

// simple '/' endpoint sending a Hello World
// response
app.get('/', (_req, res) => {
    res.sendFile(path.join(__dirname, '../../dist/index.html'));
});

io.on('connection', (socket: socketio.Socket) => {
    players[socket.id] = new Player(socket.id);
    console.log('a user connected');
    // send the players object to the new player
    socket.emit('currentPlayers', players);
    // update all other players of the new player
    socket.broadcast.emit('newPlayer', players[socket.id]);
    socket.on('disconnect', function () {
        console.log('user disconnected');
        // remove this player from our players object
        delete players[socket.id];
        // emit a message to all players to remove this player
        io.emit('disconnect', socket.id);
    });
});

// start our simple server up on localhost:8080
server.listen(8080, function () {
    console.log('listening on *:8080');
});
