const socket = io('https://game-dice.onrender.com');
let playerId = null;
let playerName = '';
let currentPlayers = {};

function joinGame() {
    const nameInput = document.getElementById('player-name').value.trim();
    const avatarInput = document.getElementById('player-avatar').value;

    if (nameInput) {
        console.log("Joining game as:", nameInput, "with avatar:", avatarInput); // Debug
        socket.emit('join-game', { name: nameInput, avatar: avatarInput });
    }
}
function rollDice() {
     // Play the dice roll sound
    const diceSound = new Audio('sounds/roll.mp3');
    diceSound.play();
    socket.emit('roll-dice');
}

socket.on('player-assigned', (id) => {
    playerId = id;
    document.getElementById('join-screen').style.display = 'none';
    document.getElementById('game').style.display = 'block';
    document.getElementById('status').textContent = `🎮 You joined as ${playerName}`;
});

socket.on('room-full', () => {
    alert("Game room is full. Please try again later.");
});

socket.on('update-scores', (players) => {
    currentPlayers = players;
    const scoreDiv = document.getElementById('scores');
    scoreDiv.innerHTML = '';

    Object.values(players).forEach(p => {
        scoreDiv.innerHTML += `
            <div class="player-score">
                <img src="images/avatars/${p.avatar}" class="avatar" />
                <p>${p.name}: ${p.score} points (🎲 ${p.rolls} rolls)</p>
            </div>`;
    });
});

socket.on('dice-rolled', ({ playerId: id, roll }) => {
    document.getElementById('dice-image').src = `images/dice${roll}.png`;

    if (id === playerId) {
        document.getElementById('status').textContent = `🎲 You rolled a ${roll}!`;
    } else {
        document.getElementById('status').textContent = `Opponent rolled a ${roll}`;
    }
});

socket.on('game-over', (msg) => {
    document.getElementById('status').textContent = msg;

    const summary = document.createElement('div');
    summary.innerHTML = '<h3>🏁 Final Scores</h3>';

    Object.values(currentPlayers).forEach(p => {
        summary.innerHTML += `<p>${p.name}: ${p.score} (🎲 ${p.rolls})</p>`;
    });

    document.body.appendChild(summary);
});
