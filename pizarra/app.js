let app = require('express')();
let server = require('http').createServer(app);
let io = require('socket.io')(server);

app.get('/',(req,res)=>{
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket)=>{
    socket.on('pixel', (p)=>{
        socket.broadcast.emit('nuevo pixel', p);
    });
});

server.listen(3000, () => console.log("server running"));