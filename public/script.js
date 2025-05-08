const socket = io();

const form = document.getElementById('form');
const input = document.getElementById('input');
const fileInput = document.getElementById('fileInput');
const messages = document.getElementById('messages');

const usernameInput = document.getElementById('username');
const colorPicker = document.getElementById('color-picker');
const joinChatButton = document.getElementById('join-chat-button');

const userSetup = document.getElementById('user-setup');
const chatSetup = document.getElementById('chat-setup');
const mainContent = document.getElementById('main-content');
const chatToggle = document.getElementById('chat-toggle');

let username = '';
let userColor = colorPicker.value;

// Entrar na "rede social"
joinChatButton.addEventListener('click', () => {
    const name = usernameInput.value.trim();
    if (name) {
        username = name;
        userColor = colorPicker.value;

        socket.emit('join chat', {
            username: username,
            color: userColor
        });

        userSetup.style.display = 'none';
        mainContent.style.display = 'block';   // Mostrar postagens
        chatSetup.style.display = 'none';      // Esconder chat por padrão
        chatToggle.style.display = 'block';    // Mostrar botão flutuante
    } else {
        alert('Por favor, escolha um nome!');
    }
});

// Botão flutuante de chat (abrir/fechar)
chatToggle.addEventListener('click', () => {
    if (chatSetup.style.display === 'none') {
        chatSetup.style.display = 'block';
    } else {
        chatSetup.style.display = 'none';
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

// Exibir mensagens no chat com estilo tipo WhatsApp
socket.on('chat message', (msg) => {
    const item = document.createElement('li');
    const isSentByUser = msg.username === username;
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.classList.add(isSentByUser ? 'sent' : 'received');

    if (!isSentByUser) {
        const userNameElem = document.createElement('span');
        userNameElem.textContent = `${msg.username}: `;
        userNameElem.style.color = msg.color;
        messageDiv.appendChild(userNameElem);
    }

    if (msg.type === 'text') {
        const textNode = document.createTextNode(msg.content);
        messageDiv.appendChild(textNode);
    } else if (msg.type === 'file') {
        if (msg.fileType.startsWith('image/')) {
            const img = document.createElement('img');
            img.src = msg.content;
            img.alt = msg.fileName;
            img.style.maxWidth = '100%';
            img.style.borderRadius = '8px';
            messageDiv.appendChild(img);
        } else {
            const link = document.createElement('a');
            link.href = msg.content;
            link.download = msg.fileName;
            link.textContent = `📎 Baixar ${msg.fileName}`;
            link.style.color = '#0095f6';
            link.style.textDecoration = 'none';
            messageDiv.appendChild(link);
        }
    }

    item.appendChild(messageDiv);
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
});
