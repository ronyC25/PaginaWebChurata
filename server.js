const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Configurar la carpeta de archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Servir la página de inicio de sesión como la página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

io.on('connection', (socket) => {
  console.log('Nuevo usuario conectado');

  socket.on('draw', (data) => {
    socket.broadcast.emit('draw', data);
  });

  socket.on('clear', () => {
    socket.broadcast.emit('clear');
  });

  socket.on('disconnect', () => {
    console.log('Usuario desconectado');
  });
});

server.listen(3000, () => {
  console.log('Servidor escuchando en http://localhost:3000');
});
