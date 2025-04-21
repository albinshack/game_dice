const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: '*',
    }
});

app.use(express.static('public'));

let players = {};

io.on('connection', (socket) => {
    socket.on('join-game', (name) => {
        if (Object.keys(players).length < 2) {
            players[socket.id] = { name, score: 0, rolls: 0 };
            io.to(socket.id).emit('player-assigned', socket.id);
            io.emit('update-scores', players);
        } else {
            socket.emit('room-full');
        }
    });

    socket.on('roll-dice', () => {
        const player = players[socket.id];
        if (player && player.rolls < 5) {
            const roll = Math.floor(Math.random() * 6) + 1;
            player.score += roll;
            player.rolls++;
            player.lastRoll = roll;
            players[socket.id] = player;
            io.emit('update-scores', players);

            const allDone = Object.values(players).every(p => p.rolls >= 5);
            if (allDone) {
                const entries = Object.entries(players);
                const [p1, p2] = entries;
                let winner = "Draw!";
                if (p1[1].score > p2[1].score) winner = `${p1[1].name} wins!`;
                else if (p1[1].score < p2[1].score) winner = `${p2[1].name} wins!`;
                io.emit('game-over', winner);
            }
        }
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
        io.emit('update-scores', players);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
