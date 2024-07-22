document.addEventListener('DOMContentLoaded', function () {
    const socket = io();
    const username = localStorage.getItem('username');
    document.getElementById('username').textContent = `Bienvenido, ${username}`;
  
    const pizarraList = document.getElementById('pizarraList');
    
    socket.on('loadPizarras', (pizarras) => {
      pizarraList.innerHTML = ''; 
      pizarras.forEach(pizarra => {
        const li = document.createElement('li');
        const link = document.createElement('a');
        link.href = `pizarra.html?id=${pizarra.id}`;
        link.textContent = pizarra.nombre;
        li.appendChild(link);
        pizarraList.appendChild(li);
      });
    });
  
    socket.on('pizarraCreated', (pizarra) => {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.href = `pizarra.html?id=${pizarra.id}`;
      link.textContent = pizarra.nombre;
      li.appendChild(link);
      pizarraList.appendChild(li);
    });
  

    document.getElementById('createPizarra').addEventListener('click', () => {
      const newPizarraName = prompt('Nombre de la nueva pizarra:');
      if (newPizarraName) {
        socket.emit('createPizarra', { nombre: newPizarraName });
      }
    });

    socket.emit('setUsername', username);
});
