let server = require('http').createServer(handler);
let io = require('socket.io')(server);

function handler(req,res){
    res.writeHead(200);
    res.end('<script src="../socket.io/socket.io.js"></script><script>io.connect()</script>');
}

io.on('connection', function (socket){
    console.log('Se conecto un nuevo socket con id: ' + socket.id);    
})

server.listen(8000,() => console.log('Server listening on port 8000'));