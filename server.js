const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

let gameRooms = {};

// Hệ thống Map tiêu chuẩn của sen
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
    
    // 1. NGƯỜI CHƠI VÀO PHÒNG
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

        // Tìm vị trí trống ngẫu nhiên để hồi sinh xe tăng
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
            : { x: 60, y: 60 }; // Tọa độ dự phòng

        // Khởi tạo thông số người chơi mới
        room.players[socket.id] = {
            id: socket.id,
            name: playerName || "Player",
            color: color || '#ef4444',
            x: pos.x,
            y: pos.y,
            angle: 0,
            isHost: pCount === 0, // Người đầu tiên vào là chủ phòng
            alive: true,
            hp: 100,
            baseSpeed: 4,      // SỬA: Đồng bộ biến baseSpeed với Client
            speedBoost: 0,
            damage: 35
        };

        io.to(roomId).emit("update-players", room.players);
    });

    // 2. BẮT ĐẦU TRẬN ĐẤU
    socket.on("start-game", (data) => {
        const { roomId, mapType } = data;
        const room = gameRooms[roomId];
        if (!room) return;

        // Chỉ cho phép chủ phòng bắt đầu trận đấu
        if (!room.players[socket.id] || !room.players[socket.id].isHost) return;

        let finalMap = maps[mapType] || maps.classic;
        room.items = [];
        room.currentMap = finalMap;
        const types = ['SPEED', 'DAMAGE', 'HEAL'];

        // Tạo sẵn 6 vật phẩm ngẫu nhiên trên bản đồ
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
                    id: "_" + Math.random().toString(36).substr(2, 9), // ID chuỗi an toàn hơn
                    x: rx * 40 + 20,
                    y: ry * 40 + 20,
                    type: types[Math.floor(Math.random() * 3)]
                });
            }
        }

        io.to(roomId).emit("game-started", { maze: finalMap, players: room.players });
        io.to(roomId).emit("spawn-items", room.items);
    });

    // 3. DI CHUYỂN XE TĂNG
    socket.on("move", (d) => {
        const room = gameRooms[d.roomId];
        if (room && room.players[socket.id] && room.players[socket.id].alive) {
            Object.assign(room.players[socket.id], { x: d.x, y: d.y, angle: d.angle });
            socket.to(d.roomId).emit("player-moved", { id: socket.id, x: d.x, y: d.y, angle: d.angle });
        }
    });

    // 4. BẮN ĐẠN
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

    // 5. XỬ LÝ TRÚNG ĐẠN
    socket.on("hit", (d) => {
        const room = gameRooms[d.roomId];
        const targetPlayer = room?.players[d.targetId];
        
        if (targetPlayer && targetPlayer.alive) {
            // Giới hạn sát thương nhận vào để tránh hack sát thương khủng từ Client
            const finalDamage = Math.min(d.damage || 35, 60); 
            
            targetPlayer.hp -= finalDamage;
            if (targetPlayer.hp <= 0) {
                targetPlayer.hp = 0; 
                targetPlayer.alive = false;
            }
            io.to(d.roomId).emit("update-players", room.players);
        }
    });

    // 6. XỬ LÝ ĂN VẬT PHẨM (ĐÃ KHẮC PHỤC LỖI BẢO MẬT CHÍT/HACK)
    socket.on("item-collected", (d) => {
        const room = gameRooms[d.roomId];
        if (!room || !room.players[socket.id] || !room.players[socket.id].alive) return;

        // SỬA: Tìm kiếm vị trí thực tế của Item trên Server dựa trên ID
        const itemIndex = room.items.findIndex(i => i.id === d.itemId);
        
        // Nếu Item không tồn tại trên Server (đã bị ăn hoặc ID lậu), chặn đứng xử lý
        if (itemIndex === -1) return;

        const serverItem = room.items[itemIndex];
        const player = room.players[socket.id];

        // SỬA: Áp dụng hiệu ứng dựa hoàn toàn trên thuộc tính gốc từ SERVER, không tin Client
        if (serverItem.type === 'HEAL') {
            player.hp = Math.min(100, player.hp + 30);
        } else if (serverItem.type === 'SPEED') {
            player.speedBoost = 2;
            setTimeout(() => { if (room.players[socket.id]) player.speedBoost = 0; }, 5000);
        } else if (serverItem.type === 'DAMAGE') {
            player.damage = 60;
            setTimeout(() => { if (room.players[socket.id]) player.damage = 35; }, 5000);
        }

        // Xóa vật phẩm khỏi dữ liệu Server và đồng bộ lại cho các máy Client khác
        room.items.splice(itemIndex, 1);
        io.to(d.roomId).emit("spawn-items", room.items);
        io.to(d.roomId).emit("update-players", room.players);

        // TÁI TẠO VẬT PHẨM SAU 15 GIÂY (AN TOÀN)
        setTimeout(() => {
            // SỬA: Kiểm tra phòng còn tồn tại không trước khi spawn để tránh sập (Crash) Server
            const currentRoom = gameRooms[d.roomId];
            if (!currentRoom) return;

            const types = ["HEAL", "SPEED", "DAMAGE"];
            const map = currentRoom.currentMap || maps.classic;

            let rx, ry, found = false, attempts = 0;
            // SỬA: Thêm điều kiện attempts tránh kẹt vòng lặp vô hạn gây đơ Server
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

    // 7. NGƯỜI CHƠI NGẮT KẾT NỐI
    socket.on("disconnect", () => {
        const roomId = socket.currentRoom;
        if (roomId && gameRooms[roomId]) {
            const wasHost = gameRooms[roomId].players[socket.id]?.isHost;
            
            // Xóa người chơi khỏi phòng dữ liệu
            delete gameRooms[roomId].players[socket.id];
            
            const remainingPlayers = Object.keys(gameRooms[roomId].players);

            if (remainingPlayers.length === 0) {
                // Nếu không còn ai, xóa luôn phòng để tiết kiệm RAM cho Server
                delete gameRooms[roomId];
            } else {
                // SỬA: Nếu Host rời đi, chuyển quyền Host sang cho người tiếp theo
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
server.listen(PORT, () => console.log("Server Online - 5 Maps Secure & Optimized!"));