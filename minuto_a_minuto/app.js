const express = require('express');
const path = require('path');
const app = express();
const socketIO = require('socket.io');

//settings
app.set('port', process.env.PORT || 3000);

//static files
app.use(express.static(path.join(__dirname, 'public')));

//run server
const server = app.listen(app.get('port'), () => {
    console.log('Server running on port:', app.get('port'));
});

app.get('/relator', (req, res) => {
    res.sendFile(__dirname + '/public/relator.html');
});

app.get('/lector', (req, res) => {
    res.sendFile(__dirname + '/public/lector.html');
});


//websockets
const io = socketIO(server);

let eventos = [];

io.on('connection', async (socket) => {
    socket.on('nuevoEvento', (evento) => {
        eventos.push(evento);
        io.emit('refrescarEventos', eventos);
        socket.join(evento);
    });

    socket.on('joinRoom', (evento) => {
        socket.join(evento);
        io.sockets.connected[socket.id].emit('message', `Has ingresado a: ${evento}`);
    });

    socket.on('relatorMessage', ({ message, room }) => {
        io.to(room).emit('message', message);
    });
});
