const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Lista de pizarras en memoria
let pizarras = [];

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/aula', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'aula.html'));
});

app.get('/pizarra', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pizarra.html'));
});

io.on('connection', (socket) => {
  console.log('Nuevo usuario conectado');

  // Enviar la lista de pizarras a los nuevos usuarios
  socket.emit('loadPizarras', pizarras);

  socket.on('joinPizarra', (data) => {
    const { pizarraId, username } = data;
    socket.join(pizarraId);
    console.log(`${username} unido a la pizarra ${pizarraId}`);

    // Enviar el estado actual de la pizarra al usuario que se une
    const pizarra = pizarras.find(p => p.id === pizarraId);
    if (pizarra) {
      socket.emit('loadPizarraState', pizarra.state);
    }
  });

  socket.on('createPizarra', (data) => {
    const newPizarra = { id: Date.now(), nombre: data.nombre, state: { imageData: null, texts: [] } };
    pizarras.push(newPizarra);
    io.emit('pizarraCreated', newPizarra);
  });

  socket.on('draw', (data) => {
    io.to(data.pizarraId).emit('draw', data);
  });

  socket.on('erase', (data) => {
    io.to(data.pizarraId).emit('erase', data);
  });

  socket.on('addText', (data) => {
    io.to(data.pizarraId).emit('addText', data);
  });

  socket.on('clear', (data) => {
    io.to(data.pizarraId).emit('clear', data);
  });

  socket.on('savePizarraState', (data) => {
    const pizarra = pizarras.find(p => p.id === data.pizarraId);
    if (pizarra) {
      pizarra.state = data.state;
    }
  });

  socket.on('disconnect', () => {
    console.log('Usuario desconectado');
  });
});

server.listen(3000, () => {
  console.log('Servidor escuchando en http://localhost:3000');
});
