var server = require('http').createServer(handler);
var io = require('socket.io')(server);
let fs = require('fs');

/**
 * Handler del servidor http
 * siempre retorna el mismo archivo index.html
 */

var html = fs.readFileSync(__dirname + '/index.html', 'utf8');

function handler(req, res) {
    res.writeHead(200);
    res.end(html);
}

/**
 * Lógica de socket.io
 */

/* let userList = [];

function usersListToHtml(userArr) {
    let html = "";
    userArr.forEach(u => {
        html += `${u.nickname}<br>`;
    });
    io.emit('refreshUserList', html);
}

io.on('connection', socket => {
    userList.push({
        id: socket.id,
        nickname: socket.handshake.query.nickname
    });
    usersListToHtml(userList)


    socket.on('message', payload => {
        const nickname = socket.handshake.query.nickname;
        const msg = `<b>${nickname}:</b> ${payload}<br>`;
        io.emit('chatRefresh', msg);
    });

    socket.on('join+18', () =>{
        socket.join('+18');
        socket.emit('joined+18','joined +18 room');
    });

    socket.on('disconnect', () => {
        userList = userList.filter(u => u.id != socket.id);
        usersListToHtml(userList)
    });
});
 */

function usersInRoom(usersArr, room) {
    let html = usersArr.filter(u => u.room === room).map(u => u.nickname);
    io.emit('refreshUserList', html);
}

let users = [];

io.of('/chat')
    .on('connection', (socket) => {
        users.push({ id: socket.id, nickname: socket.handshake.query.nickname, room: "lobby" });
        socket.on('joinRoom', (room) => {
            socket.leaveAll();
            socket.join(room);
            users.forEach((u) => {
                if (u.id === socket.id) u.room = room;
            });
            usersInRoom(users, room);
            socket.emit('joinedRoom', { room: room, users: usersInRoom });
        });

        socket.on('message', ({ message, room }) => {
            io.sockets.in(room).emit('chatRefresh', message);
        });

        socket.on('leaveRoom', (room) => {
            users.forEach(u => {
                if (u.id === socket.id) u.room = 'lobby';
                socket.leave(room);
            });
            socket.emit('leaveRoom',null);
        });

        socket.on('disconnect', () => {
            socket.leaveAll();
            users = users.filter((u) => u.id !== socket.id);
        });
    });

const notificaciones = io.of('/notificaciones');
let notificationUsers = [];

notificaciones.on('connection', socket => {
    notificationUsers.push({ id: socket.id, nickname: socket.handshake.query.nickname });

    socket.on('notificacion', () => {
        const randomUser = Math.round(Math.random() * (notificationUsers.length - 1));
        const to = notificationUsers[randomUser].id;
        const from = socket.handshake.query.nickname;
        notificaciones.to(to).emit('alert', 'usted ha recibido una notificacion de: ' + from);
    });

    socket.on('disconnect', () => {
        notificationUsers = notificationUsers.filter(u => u.id != socket.id);
    });
});

server.listen(3333, () => console.log('server running'));