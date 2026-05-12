const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Phục vụ file tĩnh (html, css, js)
app.use(express.static(__dirname));

// Biến lưu trữ các phòng game
let gameRooms = {};

io.on("connection", (socket) => {
    console.log("Thiết bị kết nối mới:", socket.id);

    // 1. Xử lý khi sen nhấn "Vào Phòng"
    socket.on("join-room", (data) => {
        const { roomId, playerName, color } = data;
        
        // Cho socket gia nhập vào "kênh" riêng của phòng đó
        socket.join(roomId);

        // Nếu phòng chưa tồn tại thì tạo mới
        if (!gameRooms[roomId]) {
            gameRooms[roomId] = { players: {} };
        }

        // Người đầu tiên vào phòng sẽ là chủ phòng (Host)
        const isHost = Object.keys(gameRooms[roomId].players).length === 0;

        // Lưu thông tin người chơi vào phòng
        gameRooms[roomId].players[socket.id] = {
            id: socket.id,
            name: playerName,
            color: color,
            x: 60, // Tọa độ xuất phát
            y: 60,
            angle: 0,
            isHost: isHost,
            alive: true
        };

        // Gửi danh sách người chơi mới nhất cho TẤT CẢ mọi người TRONG PHÒNG đó
        io.to(roomId).emit("update-players", gameRooms[roomId].players);
        console.log(`Sen ${playerName} đã vào phòng: ${roomId}`);
    });

    // 2. Xử lý khi chủ phòng nhấn "Khai chiến"
    socket.on("start-game", (roomId) => {
        io.to(roomId).emit("game-started");
    });

    // 3. Xử lý di chuyển
    socket.on("move", (data) => {
        const { roomId, x, y, angle } = data;
        if (gameRooms[roomId] && gameRooms[roomId].players[socket.id]) {
            gameRooms[roomId].players[socket.id].x = x;
            gameRooms[roomId].players[socket.id].y = y;
            gameRooms[roomId].players[socket.id].angle = angle;
            // Chỉ gửi tọa độ cho những người KHÁC trong cùng phòng
            socket.to(roomId).emit("player-moved", { id: socket.id, x, y, angle });
        }
    });

    // 4. Xử lý bắn đạn
    socket.on("shoot", (bullet) => {
        // Gửi viên đạn tới những người khác trong phòng
        socket.to(bullet.roomId).emit("new-bullet", bullet);
    });

    // 5. Xử lý khi xe tăng bị bắn trúng
    socket.on("hit", (data) => {
        const { roomId, targetId } = data;
        if (gameRooms[roomId] && gameRooms[roomId].players[targetId]) {
            gameRooms[roomId].players[targetId].alive = false;
            io.to(roomId).emit("player-hit", targetId);
        }
    });

    // 6. Xử lý khi sen thoát game
    socket.on("disconnect", () => {
        for (let roomId in gameRooms) {
            if (gameRooms[roomId].players[socket.id]) {
                console.log(`Người chơi ${gameRooms[roomId].players[socket.id].name} đã thoát`);
                delete gameRooms[roomId].players[socket.id];
                
                // Cập nhật lại danh sách cho người còn lại
                io.to(roomId).emit("update-players", gameRooms[roomId].players);
                
                // Nếu phòng trống rỗng thì xóa luôn phòng cho nhẹ server
                if (Object.keys(gameRooms[roomId].players).length === 0) {
                    delete gameRooms[roomId];
                }
            }
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server đang chạy trên cổng ${PORT}`);
    console.log(`Chiến thôi sen ơi: http://localhost:${PORT}`);
});