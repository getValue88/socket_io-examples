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

let id;
let users = 0;
let userNames = [];

io.on('connection', function (socket) {
    const connectionTimeStamp = new Date(socket.handshake.time);
    userNames.push({ id: socket.id, nickname: socket.handshake.query.nickname });

    users++;
    io.emit('totalUsers', users);

    if (!id) {
        id = socket.id;
    }
    socket.emit('newConnection', id);
    id = socket.id;

    io.emit('userList', usersToHtml(userNames));

    socket.on('disconnect', () => {
        const sessionLength = (new Date() - connectionTimeStamp) / 1000;
        userNames = userNames.filter(u => u.id != socket.id);
        users--;

        io.emit('totalUsers', users);
        console.log('User Id: ' + socket.id + ' was connected by: ' + sessionLength + 'seconds.');


        io.emit('userList', usersToHtml(userNames));
    });

    socket.on('mouseMoving', (payload) => {
        userNames.forEach(u => {
            if (u.id === socket.id) {
                u.mouse = payload;
            }
        });
        io.emit('userList', usersToHtml(userNames));
    });
});

function usersToHtml(users) {
    let html = "";
    users.forEach((u) => {
        if (!u.mouse) {
            html += u.nickname + '<br>';
        } else {
            html += u.nickname + '. Mouse: X= ' + u.mouse.x + ' Y= ' + u.mouse.y + '<br>';
        }
    });
    return html;
}


server.listen(3333, () => console.log('server running'));
