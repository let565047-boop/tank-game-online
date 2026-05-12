const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

let gameRooms = {};

const maps = {
    classic: "RANDOM",
    arena: [[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,1,1,0,0,0,0,0,0,0,1,1,0,1],[1,0,1,1,0,0,0,0,0,0,0,1,1,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,0,0,0,1,1,1,1,1,0,0,0,0,1],[1,0,0,0,0,1,0,0,0,1,0,0,0,0,1],[1,0,0,0,0,1,0,0,0,1,0,0,0,0,1],[1,0,0,0,0,1,1,1,1,1,0,0,0,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,1,1,0,0,0,0,0,0,0,1,1,0,1],[1,0,1,1,0,0,0,0,0,0,0,1,1,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]],
    cross: [[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,0,0,0,0,0,0,1,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,1,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,1,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,1,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,1,1,1,0,0,0,0,0,0,0,1,1,1,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,1,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,1,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,1,0,0,0,0,0,0,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]],
    zigzag: [[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,1,1,1,1,1,1,1,1,1,1,1,0,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,0,1,1,1,1,1,1,1,1,1,1,1,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,1,1,1,1,1,1,1,1,1,1,1,0,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,0,1,1,1,1,1,1,1,1,1,1,1,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,1,1,1,1,1,1,1,1,1,1,1,0,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]],
    fortress: [[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,0,0,0,0,0,1,1,1,0,0,0,0,0,1],[1,0,1,1,0,0,0,0,0,0,0,1,1,0,1],[1,0,1,1,0,1,1,0,1,1,0,1,1,0,1],[1,0,0,0,0,1,0,0,0,1,0,0,0,0,1],[1,0,0,1,1,1,0,0,0,1,1,1,0,0,1],[1,1,0,0,0,0,0,1,0,0,0,0,0,1,1],[1,1,0,0,0,0,0,1,0,0,0,0,0,1,1],[1,0,0,1,1,1,0,0,0,1,1,1,0,0,1],[1,0,0,0,0,1,0,0,0,1,0,0,0,0,1],[1,0,1,1,0,1,1,0,1,1,0,1,1,0,1],[1,0,1,1,0,0,0,0,0,0,0,1,1,0,1],[1,0,0,0,0,0,1,1,1,0,0,0,0,0,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]]
};

io.on("connection", (socket) => {
    console.log("Kết nối mới:", socket.id);

    socket.on("join-room", (data) => {
        const { roomId, playerName, color } = data;
        socket.join(roomId);
        socket.currentRoom = roomId; // Lưu lại để dùng khi disconnect

        if (!gameRooms[roomId]) gameRooms[roomId] = { players: {}, items: [] };

        const pCount = Object.keys(gameRooms[roomId].players).length;
        const spawns = [{x:60,y:60},{x:540,y:540},{x:540,y:60},{x:60,y:540}];
        const pos = spawns[pCount] || {x:300,y:300};

        gameRooms[roomId].players[socket.id] = {
            id: socket.id, 
            name: playerName, 
            color: color || '#ef4444',
            x: pos.x, 
            y: pos.y, 
            angle: 0, 
            isHost: pCount === 0,
            alive: true, 
            hp: 100, 
            speed: 3, 
            damage: 35
        };
        io.to(roomId).emit("update-players", gameRooms[roomId].players);
    });

    socket.on("start-game", (data) => {
        const { roomId, mapType } = data;
        const room = gameRooms[roomId];
        if (room) {
            let finalMap = maps[mapType] || maps.classic;
            room.items = [];
            const types = ['SPEED', 'DAMAGE', 'HEAL'];
            
            for(let i=0; i<6; i++) {
                let rx, ry, found = false, attempts = 0;
                while(!found && attempts < 50) {
                    rx = Math.floor(Math.random() * 13 + 1);
                    ry = Math.floor(Math.random() * 13 + 1);
                    if (finalMap === "RANDOM") { if(rx%2!==0 && ry%2!==0) found = true; }
                    else if (finalMap[ry] && finalMap[ry][rx] === 0) found = true;
                    attempts++;
                }
                if (found) {
                    room.items.push({ 
                        id: Math.random(), 
                        x: rx * 40 + 20, 
                        y: ry * 40 + 20, 
                        type: types[Math.floor(Math.random() * 3)] 
                    });
                }
            }
            io.to(roomId).emit("game-started", { maze: finalMap, players: room.players });
            io.to(roomId).emit("spawn-items", room.items);
        }
    });

    socket.on("move", (d) => {
        if(gameRooms[d.roomId]?.players[socket.id]) {
            Object.assign(gameRooms[d.roomId].players[socket.id], { x: d.x, y: d.y, angle: d.angle });
            socket.to(d.roomId).emit("player-moved", { id: socket.id, x: d.x, y: d.y, angle: d.angle });
        }
    });

    socket.on("shoot", (data) => {
        socket.to(data.roomId).emit("new-bullet", { 
            id: socket.id, 
            x: data.x, 
            y: data.y, 
            angle: data.angle, 
            damage: gameRooms[data.roomId]?.players[socket.id]?.damage || 35 
        });
    });

    socket.on("hit", (d) => {
        const room = gameRooms[d.roomId];
        const p = room?.players[d.targetId];
        if (p && p.alive) {
            p.hp -= d.damage;
            if (p.hp <= 0) { 
                p.hp = 0; p.alive = false; 
                io.to(d.targetId).emit("game-over", { result: "DEFEAT" }); 
                socket.emit("game-over", { result: "VICTORY" }); 
            }
            io.to(d.roomId).emit("update-players", room.players);
        }
    });

    socket.on("item-collected", (d) => {
        const room = gameRooms[d.roomId];
        if (room && room.players[socket.id]) {
            if (d.type === 'HEAL') {
                room.players[socket.id].hp = Math.min(100, room.players[socket.id].hp + 40);
            }
            room.items = room.items.filter(i => i.id !== d.itemId);
            io.to(d.roomId).emit("spawn-items", room.items);
            io.to(d.roomId).emit("update-players", room.players);
        }
    });

    socket.on("disconnect", () => {
        const roomId = socket.currentRoom;
        if (roomId && gameRooms[roomId]) {
            delete gameRooms[roomId].players[socket.id];
            if (Object.keys(gameRooms[roomId].players).length === 0) {
                delete gameRooms[roomId];
            } else {
                io.to(roomId).emit("update-players", gameRooms[roomId].players);
            }
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Server Online tại cổng: " + PORT));