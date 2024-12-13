import { getCurrentUser } from '../api/userApi.js';
import { getMessagesForChatroom, sendMessage } from '../api/chatApi.js';
import { navigateTo } from '../router.js';

export async function renderView() {
    const content = document.getElementById('content');
    content.textContent = 'Loading chatroom...';

    const userData = await getCurrentUser();
    if (!userData.loggedIn) {
        alert('You must be logged in to view chatrooms.');
        navigateTo('/login');
        return;
    }

    const chatroomName = 'one'; // You might determine this from window.location.pathname

    const data = await getMessagesForChatroom(chatroomName);
    if (!data.success) {
        content.textContent = '';
        const p = document.createElement('p');
        p.textContent = `Error loading chatroom: ${data.error || 'Unknown error'}`;
        content.appendChild(p);
        return;
    }

    content.textContent = '';
    const h2 = document.createElement('h2');
    h2.textContent = `Chatroom: ${chatroomName}`;
    content.appendChild(h2);

    const ul = document.createElement('ul');
    data.messages.forEach(msg => {
        const li = document.createElement('li');
        // Safe insertion of text:
        li.textContent = `${msg.username}: ${msg.message} (${msg.timestamp})`;
        if (msg.image_path) {
            // Display an image (safe because it's a controlled path)
            const img = document.createElement('img');
            img.src = msg.image_path;
            img.alt = 'Message image';
            img.width = 100; // small preview
            li.appendChild(document.createTextNode(' '));
            li.appendChild(img);
        }
        ul.appendChild(li);
    });
    content.appendChild(ul);

    // Message form
    const form = document.createElement('form');

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Enter your message';
    input.required = true;

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.png,.jpg,.jpeg,.webp';

    const sendBtn = document.createElement('button');
    sendBtn.type = 'submit';
    sendBtn.textContent = 'Send';

    form.appendChild(input);
    form.appendChild(fileInput);
    form.appendChild(sendBtn);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const file = fileInput.files.length > 0 ? fileInput.files[0] : null;
        const result = await sendMessage(chatroomName, input.value.trim(), file);
        if (result.success) {
            // Reload messages or append new message to the list
            const newLi = document.createElement('li');
            newLi.textContent = `${userData.user.username}: ${input.value.trim()} (Just now)`;
            if (result.imagePath) {
                const img = document.createElement('img');
                img.src = result.imagePath;
                img.alt = 'Message image';
                img.width = 100;
                newLi.appendChild(document.createTextNode(' '));
                newLi.appendChild(img);
            }
            ul.appendChild(newLi);
            input.value = '';
            fileInput.value = '';
        } else {
            alert(`Error sending message: ${result.error}`);
        }
    });

    content.appendChild(form);
}
