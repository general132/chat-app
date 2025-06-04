const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// Servir arquivos estáticos da pasta "public"
app.use(express.static('public'));

// Evento de conexão
io.on('connection', (socket) => {
  console.log('Um usuário entrou');

  // Ouvir o evento 'chat message' para mensagens de texto ou arquivos
  socket.on('chat message', (msg) => {
    console.log('Mensagem recebida: ', msg);

    // Emitir a mensagem para todos os outros clientes sem a parte do sistema
    io.emit('chat message', msg);
  });

  // Quando um usuário desconectar
  socket.on('disconnect', () => {
    console.log('Um usuário saiu');
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${3000}`);
});
