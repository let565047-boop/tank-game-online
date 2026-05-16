const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

let gameRooms = {};

const maps = {
    classic: [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
    arena: [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1], [1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1], [1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]],
    cross: [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]],
    zigzag: [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]],
    fortress: [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1], [1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1], [1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1], [1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1], [1, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 1], [1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1], [1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1], [1, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 1], [1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1], [1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1], [1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1], [1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]]
};

io.on("connection", (socket) => {
    
    socket.on("join-room", (data) => {
        const { roomId, playerName, color } = data;
        if (!roomId) return;

        socket.join(roomId);
        socket.currentRoom = roomId;

        if (!gameRooms[roomId]) {
            gameRooms[roomId] = { players: {}, items: [], currentMap: maps.classic };
        }
        
        const room = gameRooms[roomId];
        const pCount = Object.keys(room.players).length;
        const map = room.currentMap;

        let emptyTiles = [];
        for (let y = 1; y < map.length - 1; y++) {
            for (let x = 1; x < map[y].length - 1; x++) {
                if (map[y][x] === 0) {
                    emptyTiles.push({ x: x * 40 + 20, y: y * 40 + 20 });
                }
            }
        }

        const pos = emptyTiles.length > 0 
            ? emptyTiles[Math.floor(Math.random() * emptyTiles.length)]
            : { x: 60, y: 60 };

        room.players[socket.id] = {
            id: socket.id,
            name: playerName || "Player",
            color: color || '#ef4444',
            x: pos.x,
            y: pos.y,
            angle: 0,
            isHost: pCount === 0,
            alive: true,
            hp: 100,
            baseSpeed: 4,      
            speedBoost: 0,
            damage: 35
        };

        io.to(roomId).emit("update-players", room.players);
    });

    // CHỨNG NĂNG KHỞI ĐỘNG GAME (ĐÃ VÁ LỖI KẸT TƯỜNG)
    socket.on("start-game", (data) => {
        const { roomId, mapType } = data;
        const room = gameRooms[roomId];
        if (!room) return;

        if (!room.players[socket.id] || !room.players[socket.id].isHost) return;

        let finalMap = maps[mapType] || maps.classic;
        room.items = [];
        room.currentMap = finalMap;
        const types = ['SPEED', 'DAMAGE', 'HEAL'];

        // 🔥 THAY ĐỔI: Tìm tất cả ô trống của MAP MỚI được chọn
        let emptyTiles = [];
        for (let y = 1; y < finalMap.length - 1; y++) {
            for (let x = 1; x < finalMap[y].length - 1; x++) {
                if (finalMap[y][x] === 0) {
                    emptyTiles.push({ x: x * 40 + 20, y: y * 40 + 20 });
                }
            }
        }

        // 🔥 THAY ĐỔI: Sắp xếp lại vị trí ngẫu nhiên không kẹt tường cho MỌI người chơi
        Object.keys(room.players).forEach(pId => {
            const pos = emptyTiles.length > 0 
                ? emptyTiles[Math.floor(Math.random() * emptyTiles.length)]
                : { x: 60, y: 60 };
            
            room.players[pId].x = pos.x;
            room.players[pId].y = pos.y;
            room.players[pId].hp = 100; // Reset đầy máu khi trận đấu bắt đầu
            room.players[pId].alive = true;
        });

        // Tạo 6 item ngẫu nhiên
        for (let i = 0; i < 6; i++) {
            let rx, ry, found = false, attempts = 0;
            while (!found && attempts < 50) {
                rx = Math.floor(Math.random() * 13 + 1);
                ry = Math.floor(Math.random() * 13 + 1);
                if (finalMap[ry] && finalMap[ry][rx] === 0) found = true;
                attempts++;
            }
            if (found) {
                room.items.push({
                    id: "_" + Math.random().toString(36).substr(2, 9),
                    x: rx * 40 + 20,
                    y: ry * 40 + 20,
                    type: types[Math.floor(Math.random() * 3)]
                });
            }
        }

        io.to(roomId).emit("game-started", { maze: finalMap, players: room.players });
        io.to(roomId).emit("spawn-items", room.items);
    });

    socket.on("move", (d) => {
        const room = gameRooms[d.roomId];
        if (room && room.players[socket.id] && room.players[socket.id].alive) {
            Object.assign(room.players[socket.id], { x: d.x, y: d.y, angle: d.angle });
            socket.to(d.roomId).emit("player-moved", { id: socket.id, x: d.x, y: d.y, angle: d.angle });
        }
    });

    socket.on("shoot", (data) => {
        const room = gameRooms[data.roomId];
        const player = room?.players[socket.id];
        if (!player || !player.alive) return;

        io.to(data.roomId).emit("new-bullet", {
            id: socket.id,
            x: player.x,
            y: player.y,
            angle: player.angle,
            damage: player.damage
        });
    });

    socket.on("hit", (d) => {
        const room = gameRooms[d.roomId];
        const targetPlayer = room?.players[d.targetId];
        if (targetPlayer && targetPlayer.alive) {
            const finalDamage = Math.min(d.damage || 35, 60); 
            targetPlayer.hp -= finalDamage;
            if (targetPlayer.hp <= 0) {
                targetPlayer.hp = 0; 
                targetPlayer.alive = false;
            }
            io.to(d.roomId).emit("update-players", room.players);
        }
    });

    // CHỨC NĂNG ĂN VẬT PHẨM (ĐÃ NÂNG THỜI GIAN BUFF LÊN 15 GIÂY)
    socket.on("item-collected", (d) => {
        const room = gameRooms[d.roomId];
        if (!room || !room.players[socket.id] || !room.players[socket.id].alive) return;

        const itemIndex = room.items.findIndex(i => i.id === d.itemId);
        if (itemIndex === -1) return;

        const serverItem = room.items[itemIndex];
        const player = room.players[socket.id];

        if (serverItem.type === 'HEAL') {
            player.hp = Math.min(100, player.hp + 30);
        } else if (serverItem.type === 'SPEED') {
            player.speedBoost = 2;
            // ⏱️ THAY ĐỔI: Kéo dài thời gian hiệu ứng tăng tốc lên 15 giây (15000ms)
            setTimeout(() => { 
                if (gameRooms[d.roomId]?.players[socket.id]) gameRooms[d.roomId].players[socket.id].speedBoost = 0; 
            }, 15000);
        } else if (serverItem.type === 'DAMAGE') {
            player.damage = 60;
            // ⏱️ THAY ĐỔI: Kéo dài thời gian hiệu ứng tăng sát thương lên 15 giây (15000ms)
            setTimeout(() => { 
                if (gameRooms[d.roomId]?.players[socket.id]) gameRooms[d.roomId].players[socket.id].damage = 35; 
            }, 15000);
        }

        room.items.splice(itemIndex, 1);
        io.to(d.roomId).emit("spawn-items", room.items);
        io.to(d.roomId).emit("update-players", room.players);

        setTimeout(() => {
            const currentRoom = gameRooms[d.roomId];
            if (!currentRoom) return;

            const types = ["HEAL", "SPEED", "DAMAGE"];
            const map = currentRoom.currentMap || maps.classic;

            let rx, ry, found = false, attempts = 0;
            while (!found && attempts < 50) {
                rx = Math.floor(Math.random() * 13 + 1);
                ry = Math.floor(Math.random() * 13 + 1);
                if (map[ry] && map[ry][rx] === 0) found = true;
                attempts++;
            }

            if (found) {
                currentRoom.items.push({
                    id: "_" + Math.random().toString(36).substr(2, 9),
                    x: rx * 40 + 20,
                    y: ry * 40 + 20,
                    type: types[Math.floor(Math.random() * 3)]
                });
                io.to(d.roomId).emit("spawn-items", currentRoom.items);
            }
        }, 15000);
    });

    socket.on("disconnect", () => {
        const roomId = socket.currentRoom;
        if (roomId && gameRooms[roomId]) {
            const wasHost = gameRooms[roomId].players[socket.id]?.isHost;
            delete gameRooms[roomId].players[socket.id];
            const remainingPlayers = Object.keys(gameRooms[roomId].players);

            if (remainingPlayers.length === 0) {
                delete gameRooms[roomId];
            } else {
                if (wasHost) {
                    const nextHostId = remainingPlayers[0];
                    gameRooms[roomId].players[nextHostId].isHost = true;
                }
                io.to(roomId).emit("update-players", gameRooms[roomId].players);
            }
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Server Online - Bug Fixed!"));