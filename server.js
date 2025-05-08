const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// Servir arquivos estáticos da pasta "public"
app.use(express.static('public'));

let users = {}; // Armazenar dados dos usuários

io.on('connection', (socket) => {
  console.log('Um usuário entrou');

  // Ouvir evento de "join chat" com informações de usuário
  socket.on('join chat', (userInfo) => {
    users[socket.id] = userInfo; // Armazenar nome e cor do usuário
    console.log(`Novo usuário: ${userInfo.username} com cor: ${userInfo.color}`);

    // Notificar todos os usuários sobre a entrada
    io.emit('chat message', {
      type: 'system',
      content: `${userInfo.username} entrou no chat.`,
      username: 'Sistema',
      color: '#000000'
    });
  });

  // Ouvir o evento 'chat message' para mensagens de texto ou arquivos
  socket.on('chat message', (msg) => {
    console.log('Mensagem recebida: ', msg);

    // Verificar se o usuário existe antes de enviar a mensagem
    if (users[socket.id]) {
      // Emitir a mensagem para todos os outros clientes
      io.emit('chat message', msg);
    }
  });

  // Quando um usuário desconectar
  socket.on('disconnect', () => {
    console.log('Um usuário saiu');
    
    // Enviar uma mensagem para todos quando um usuário sai
    if (users[socket.id]) {
      const username = users[socket.id].username;
      io.emit('chat message', {
        type: 'system',
        content: `${username} saiu do chat.`,
        username: 'Sistema',
        color: '#000000'
      });
      delete users[socket.id]; // Remover o usuário da lista
    }
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${3000}`);
});
