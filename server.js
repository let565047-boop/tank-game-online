const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

let gameRooms = {};

// 5 Loại bản đồ cực cháy
const maps = {
    classic: "RANDOM",
    arena: [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,1,1,0,0,0,0,0,0,0,1,1,0,1],
        [1,0,1,1,0,0,0,0,0,0,0,1,1,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,1,1,1,1,1,0,0,0,0,1],
        [1,0,0,0,0,1,0,0,0,1,0,0,0,0,1],
        [1,0,0,0,0,1,0,0,0,1,0,0,0,0,1],
        [1,0,0,0,0,1,1,1,1,1,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,1,1,0,0,0,0,0,0,0,1,1,0,1],
        [1,0,1,1,0,0,0,0,0,0,0,1,1,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ],
    cross: [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,0,0,0,0,0,0,0,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ],
    zigzag: [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ],
    fortress: [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,1,1,1,0,0,0,0,0,1],
        [1,0,1,1,0,0,0,0,0,0,0,1,1,0,1],
        [1,0,1,1,0,1,1,0,1,1,0,1,1,0,1],
        [1,0,0,0,0,1,0,0,0,1,0,0,0,0,1],
        [1,0,0,1,1,1,0,0,0,1,1,1,0,0,1],
        [1,1,0,0,0,0,0,1,0,0,0,0,0,1,1],
        [1,1,0,0,0,0,0,1,0,0,0,0,0,1,1],
        [1,0,0,1,1,1,0,0,0,1,1,1,0,0,1],
        [1,0,0,0,0,1,0,0,0,1,0,0,0,0,1],
        [1,0,1,1,0,1,1,0,1,1,0,1,1,0,1],
        [1,0,1,1,0,0,0,0,0,0,0,1,1,0,1],
        [1,0,0,0,0,0,1,1,1,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ]
};

io.on("connection", (socket) => {
    socket.on("join-room", (data) => {
        const { roomId, playerName, color } = data;
        socket.join(roomId);
        if (!gameRooms[roomId]) gameRooms[roomId] = { players: {}, items: [] };

        const isHost = Object.keys(gameRooms[roomId].players).length === 0;
        gameRooms[roomId].players[socket.id] = {
            id: socket.id, name: playerName, color: color,
            x: 60, y: 60, angle: 0, isHost: isHost, alive: true, 
            hp: 100, speed: 3, damage: 35, fireRate: 600
        };
        io.to(roomId).emit("update-players", gameRooms[roomId].players);
    });

    socket.on("start-game", (data) => {
        const { roomId, mapType } = data;
        if (gameRooms[roomId]) {
            let finalMap = maps[mapType] || "RANDOM";
            gameRooms[roomId].items = [];
            const types = ['SPEED', 'DAMAGE', 'HEAL'];
            for(let i=0; i<5; i++) {
                gameRooms[roomId].items.push({
                    id: Math.random(),
                    x: Math.floor(Math.random() * 13 + 1) * 40 + 20,
                    y: Math.floor(Math.random() * 13 + 1) * 40 + 20,
                    type: types[Math.floor(Math.random() * types.length)]
                });
            }
            io.to(roomId).emit("game-started", { map: finalMap });
            io.to(roomId).emit("spawn-items", gameRooms[roomId].items);
        }
    });

    socket.on("item-collected", (data) => {
        const { roomId, itemId, type } = data;
        if (gameRooms[roomId]) {
            // ĐỒNG BỘ MÁU: Nếu ăn túi hồi máu, server cập nhật máu ngay
            if (type === 'HEAL' && gameRooms[roomId].players[socket.id]) {
                let p = gameRooms[roomId].players[socket.id];
                p.hp = Math.min(100, p.hp + 40);
            }
            
            gameRooms[roomId].items = gameRooms[roomId].items.filter(i => i.id !== itemId);
            io.to(roomId).emit("spawn-items", gameRooms[roomId].items);
            io.to(roomId).emit("update-players", gameRooms[roomId].players);
        }
    });

    socket.on("move", (data) => {
        const { roomId, x, y, angle } = data;
        if (gameRooms[roomId]?.players[socket.id]) {
            Object.assign(gameRooms[roomId].players[socket.id], { x, y, angle });
            socket.to(roomId).emit("player-moved", { id: socket.id, x, y, angle });
        }
    });

    socket.on("shoot", (bullet) => socket.to(bullet.roomId).emit("new-bullet", bullet));

    socket.on("hit", (data) => {
        const { roomId, targetId, damage } = data;
        const room = gameRooms[roomId];
        if (room && room.players[targetId] && room.players[targetId].alive) {
            room.players[targetId].hp -= damage;
            
            if (room.players[targetId].hp <= 0) {
                room.players[targetId].hp = 0; 
                room.players[targetId].alive = false;
                io.to(targetId).emit("game-over", { result: "DEFEAT" });
                socket.emit("game-over", { result: "VICTORY" });
                setTimeout(() => io.to(roomId).emit("return-to-lobby"), 4000);
            }
            // Gửi cập nhật để thanh máu địch tụt ngay lập tức
            io.to(roomId).emit("update-players", room.players);
        }
    });

    socket.on("disconnect", () => {
        for (let roomId in gameRooms) {
            if (gameRooms[roomId].players[socket.id]) {
                delete gameRooms[roomId].players[socket.id];
                io.to(roomId).emit("update-players", gameRooms[roomId].players);
                if (Object.keys(gameRooms[roomId].players).length === 0) delete gameRooms[roomId];
            }
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server chạy tại cổng ${PORT}`));