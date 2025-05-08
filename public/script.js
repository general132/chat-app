const socket = io();
const form = document.getElementById('form');
const input = document.getElementById('input');
const fileInput = document.getElementById('fileInput');
const messages = document.getElementById('messages');
const usernameInput = document.getElementById('username');
const colorPicker = document.getElementById('color-picker');
const joinChatButton = document.getElementById('join-chat');

let username = '';
let userColor = colorPicker.value;

// Quando o usuário clicar no botão para entrar no chat
joinChatButton.addEventListener('click', () => {
  if (usernameInput.value.trim()) {
    username = usernameInput.value.trim();
    userColor = colorPicker.value;

    // Enviar nome de usuário e cor para o servidor
    socket.emit('join chat', {
      username: username,
      color: userColor
    });

    // Ocultar a área de configuração (nome e cor)
    document.getElementById('user-setup').style.display = 'none';

    // Exibir o formulário de mensagens
    document.getElementById('chat-setup').style.display = 'block';
  } else {
    alert('Por favor, escolha um nome!');
  }
});

// Enviar mensagem (texto ou arquivo)
form.addEventListener('submit', (e) => {
  e.preventDefault();

  let sent = false;

  if (input.value.trim()) {
    socket.emit('chat message', {
      type: 'text',
      content: input.value.trim(),
      username: username,
      color: userColor
    });
    input.value = '';
    sent = true;
  }

  if (fileInput.files.length > 0) {
    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      socket.emit('chat message', {
        type: 'file',
        fileName: file.name,
        fileType: file.type,
        content: reader.result,
        username: username,
        color: userColor
      });
      fileInput.value = '';
    };

    reader.readAsDataURL(file);
    sent = true;
  }

  if (!sent) {
    alert('Digite uma mensagem ou selecione um arquivo.');
  }
});

// Exibir mensagens no chat
socket.on('chat message', (msg) => {
  const item = document.createElement('li');

  // Exibir nome do usuário e cor
  const userNameElem = document.createElement('span');
  userNameElem.textContent = `${msg.username}: `;
  userNameElem.style.color = msg.color;

  // Exibir mensagem
  if (msg.type === 'text') {
    item.appendChild(userNameElem);
    item.appendChild(document.createTextNode(msg.content));
  } else if (msg.type === 'file') {
    item.appendChild(userNameElem);
    if (msg.fileType.startsWith('image/')) {
      const img = document.createElement('img');
      img.src = msg.content;
      img.alt = msg.fileName;
      img.style.maxWidth = '100%';
      img.style.borderRadius = '8px';
      item.appendChild(img);
    } else {
      const link = document.createElement('a');
      link.href = msg.content;
      link.download = msg.fileName;
      link.textContent = `📎 Baixar ${msg.fileName}`;
      link.style.color = '#4CAF50';
      link.style.textDecoration = 'none';
      item.appendChild(link);
    }
  }

  messages.appendChild(item);
  messages.scrollTop = messages.scrollHeight;
});
