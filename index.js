const path = require('path');
const express = require('express');
const app = express();

//configuracion
app.set('port', process.env.PORT || 3000);

//archivos estaticos
app.use(express.static(path.join(__dirname, 'public')));


//iniciar el servidor
const server = app.listen(app.get('port'), () => {
    console.log('Server on port', app.get('port'));
});

//Websockets
const SocketIO = require('socket.io');
const io = SocketIO(server);

io.on('connection', () => {
    console.log('Un usuario se ha conectado');
})



