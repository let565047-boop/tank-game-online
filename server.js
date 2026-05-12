const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

let players = {};

io.on("connection", (socket) => {
    console.log("Player connected:", socket.id);

    players[socket.id] = {
        x: 100,
        y: 100,
        angle: 0
    };

    io.emit("players", players);

    socket.on("move", (data) => {
        players[socket.id] = data;
        io.emit("players", players);
    });

    socket.on("disconnect", () => {
        delete players[socket.id];
        io.emit("players", players);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server đang chạy trên cổng ${PORT}`);
    console.log(`Bắn tank thôi sen ơi: http://localhost:${PORT}`);
});