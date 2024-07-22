document.getElementById('loginForm').addEventListener('submit', function(event) {
  event.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  if (username && password) {
    localStorage.setItem('username', username);
    window.location.href = 'aula.html';
  } else {
    alert('Nombre de usuario o contraseña incorrectos');
  }
});
