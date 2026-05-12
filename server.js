const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

let gameRooms = {};

// 5 Loại bản đồ Sen đã duyệt - Tui để dạng mảng cho Sen dễ nhìn
const maps = {
    classic: "RANDOM",
    arena: [[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,1,1,0,0,0,0,0,0,0,1,1,0,1],[1,0,1,1,0,0,0,0,0,0,0,1,1,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,0,0,0,1,1,1,1,1,0,0,0,0,1],[1,0,0,0,0,1,0,0,0,1,0,0,0,0,1],[1,0,0,0,0,1,0,0,0,1,0,0,0,0,1],[1,0,0,0,0,1,1,1,1,1,0,0,0,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,1,1,0,0,0,0,0,0,0,1,1,0,1],[1,0,1,1,0,0,0,0,0,0,0,1,1,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]],
    cross: [[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,0,0,0,0,0,0,1,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,1,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,1,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,1,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,1,1,1,0,0,0,0,0,0,0,1,1,1,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,1,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,1,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,1,0,0,0,0,0,0,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]],
    zigzag: [[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,1,1,1,1,1,1,1,1,1,1,1,0,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,0,1,1,1,1,1,1,1,1,1,1,1,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,1,1,1,1,1,1,1,1,1,1,1,0,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,0,1,1,1,1,1,1,1,1,1,1,1,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,1,1,1,1,1,1,1,1,1,1,1,0,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]],
    fortress: [[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,0,0,0,0,0,1,1,1,0,0,0,0,0,1],[1,0,1,1,0,0,0,0,0,0,0,1,1,0,1],[1,0,1,1,0,1,1,0,1,1,0,1,1,0,1],[1,0,0,0,0,1,0,0,0,1,0,0,0,0,1],[1,0,0,1,1,1,0,0,0,1,1,1,0,0,1],[1,1,0,0,0,0,0,1,0,0,0,0,0,1,1],[1,1,0,0,0,0,0,1,0,0,0,0,0,1,1],[1,0,0,1,1,1,0,0,0,1,1,1,0,0,1],[1,0,0,0,0,1,0,0,0,1,0,0,0,0,1],[1,0,1,1,0,1,1,0,1,1,0,1,1,0,1],[1,0,1,1,0,0,0,0,0,0,0,1,1,0,1],[1,0,0,0,0,0,1,1,1,0,0,0,0,0,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]]
};

io.on("connection", (socket) => { // Phải có dấu { ở đây
    socket.on("join-room", (data) => {
        const { roomId, playerName, color } = data;
        socket.join(roomId);
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
    
    // Đừng quên đóng ngoặc của io.on ở cuối file nữa nha!
});
 socket.on("start-game", (data) => {
        const { roomId, mapType } = data;
        const room = gameRooms[roomId];
        if (room) {
            let finalMap = maps[mapType] || maps.classic;
            room.items = [];
            const types = ['SPEED', 'DAMAGE', 'HEAL'];
            
            // Rải 6 món đồ ngẫu nhiên
            for(let i=0; i<6; i++) {
                let rx, ry, found = false, attempts = 0;
                while(!found && attempts < 50) {
                    rx = Math.floor(Math.random() * 13 + 1);
                    ry = Math.floor(Math.random() * 13 + 1);
                    if (finalMap === "RANDOM") { if(rx%2!==0 && ry%2!==0) found = true; }
                    else if (finalMap[ry][rx] === 0) found = true;
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
            // Gửi dữ liệu về cho sen
            io.to(roomId).emit("game-started", { map: finalMap, players: room.players });
            io.to(roomId).emit("spawn-items", room.items); // Dòng này quan trọng nè!
        }
    });
    socket.on("move", (d) => {
        if(gameRooms[d.roomId]?.players[socket.id]) {
            Object.assign(gameRooms[d.roomId].players[socket.id], { x: d.x, y: d.y, angle: d.angle });
            socket.to(d.roomId).emit("player-moved", { id: socket.id, x: d.x, y: d.y, angle: d.angle });
        }
    });

    socket.on("shoot", (b) => socket.to(b.roomId).emit("new-bullet", b));

    socket.on("hit", (d) => {
        const p = gameRooms[d.roomId]?.players[d.targetId];
        if (p && p.alive) {
            p.hp -= d.damage;
            if (p.hp <= 0) { p.hp = 0; p.alive = false; io.to(d.targetId).emit("game-over", { result: "DEFEAT" }); socket.emit("game-over", { result: "VICTORY" }); }
            io.to(d.roomId).emit("update-players", gameRooms[d.roomId].players);
        }
    });

socket.on("item-collected", (d) => {
        const room = gameRooms[d.roomId];
        if (room) {
            // Nếu là túi máu (HEAL), server cập nhật máu gốc của sen luôn cho chắc
            if (d.type === 'HEAL' && room.players[socket.id]) {
                room.players[socket.id].hp = Math.min(100, room.players[socket.id].hp + 40);
            }
            
            // Xóa món đồ đó khỏi danh sách của phòng
            room.items = room.items.filter(i => i.id !== d.itemId);
            
            // Báo cho tất cả mọi người là đồ đã bị lấy mất rồi
            io.to(d.roomId).emit("spawn-items", room.items);
            // Cập nhật lại thanh máu cho mọi người cùng thấy
            io.to(d.roomId).emit("update-players", room.players);
        }
    });

server.listen(process.env.PORT || 3000, () => console.log("Server Online!"))
