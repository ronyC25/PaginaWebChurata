document.addEventListener('DOMContentLoaded', function () {
  const socket = io();
  const canvas = document.getElementById('canvas');
  const context = canvas.getContext('2d');
  const urlParams = new URLSearchParams(window.location.search);
  const pizarraId = urlParams.get('id');
  const username = localStorage.getItem('username');
  document.getElementById('username').textContent = username;

  // Unirse a la pizarra con la identificación del usuario
  socket.emit('joinPizarra', { pizarraId, username });

  let drawing = false;
  let color = '#000000';
  let size = 5;
  let lastX, lastY;
  let tool = 'pencil';
  let history = [];
  let redoList = [];

  document.getElementById('pencil').addEventListener('click', () => tool = 'pencil');
  document.getElementById('eraser').addEventListener('click', () => tool = 'eraser');
  document.getElementById('save').addEventListener('click', saveCanvas);
  document.getElementById('load').addEventListener('change', loadCanvas);
  document.getElementById('addText').addEventListener('click', addText);
  document.getElementById('clear').addEventListener('click', clearCanvas);
  document.getElementById('colorPicker').addEventListener('input', (event) => color = event.target.value);
  document.getElementById('sizePicker').addEventListener('input', (event) => size = event.target.value);
  document.getElementById('undo').addEventListener('click', undo);
  document.getElementById('redo').addEventListener('click', redo);

  canvas.addEventListener('mousedown', (event) => {
    drawing = true;
    const [x, y] = getMousePos(canvas, event);
    lastX = x;
    lastY = y;
  });

  canvas.addEventListener('mouseup', () => {
    drawing = false;
    context.beginPath();
    saveState(); 
  });

  canvas.addEventListener('mousemove', (event) => {
    if (!drawing) return;
    const [x, y] = getMousePos(canvas, event);
    if (tool === 'pencil') {
      drawLine(lastX, lastY, x, y, color, size);
    } else if (tool === 'eraser') {
      eraseLine(lastX, lastY, x, y, size);
    }
    lastX = x;
    lastY = y;
  });

  function drawLine(x1, y1, x2, y2, color, size) {
    context.strokeStyle = color;
    context.lineWidth = size;
    context.lineCap = 'round';
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
    context.closePath();
    socket.emit('draw', { pizarraId, x1, y1, x2, y2, color, size, username });
  }

  function eraseLine(x1, y1, x2, y2, size) {
    context.strokeStyle = '#FFFFFF';
    context.lineWidth = size;
    context.lineCap = 'round';
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
    context.closePath();
    socket.emit('erase', { pizarraId, x1, y1, x2, y2, size, username });
  }

  function addText() {
    const text = document.getElementById('textInput').value;
    if (text) {
      context.font = '20px Arial';
      context.fillStyle = color;
      context.fillText(text, lastX, lastY);
      socket.emit('addText', { pizarraId, text, x: lastX, y: lastY, color, username });
    }
  }

  function clearCanvas() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    socket.emit('clear', { pizarraId, username });
  }

  function saveCanvas() {
    const dataURL = canvas.toDataURL();
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'pizarra.png';
    link.click();
  }

  function loadCanvas(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const img = new Image();
        img.onload = function () {
          context.drawImage(img, 0, 0);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  function undo() {
    if (history.length > 0) {
      redoList.push(context.getImageData(0, 0, canvas.width, canvas.height));
      const state = history.pop();
      context.putImageData(state, 0, 0);
    }
  }

  function redo() {
    if (redoList.length > 0) {
      history.push(context.getImageData(0, 0, canvas.width, canvas.height));
      const state = redoList.pop();
      context.putImageData(state, 0, 0);
    }
  }

  function saveState() {
    history.push(context.getImageData(0, 0, canvas.width, canvas.height));
  }

  function getMousePos(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    return [event.clientX - rect.left, event.clientY - rect.top];
  }

  socket.on('draw', (data) => {
    drawLine(data.x1, data.y1, data.x2, data.y2, data.color, data.size);
  });

  socket.on('erase', (data) => {
    eraseLine(data.x1, data.y1, data.x2, data.y2, data.size);
  });

  socket.on('addText', (data) => {
    context.font = '20px Arial';
    context.fillStyle = data.color;
    context.fillText(data.text, data.x, data.y);
  });

  socket.on('clear', () => {
    clearCanvas();
  });

  socket.on('loadPizarraState', (state) => {
    if (state.imageData) {
      const img = new Image();
      img.onload = function () {
        context.drawImage(img, 0, 0);
      };
      img.src = state.imageData;
    }
    state.texts.forEach(text => {
      context.font = '20px Arial';
      context.fillStyle = text.color;
      context.fillText(text.text, text.x, text.y);
    });
  });
});
