export async function getChatrooms() {
    const resp = await fetch('/api/chatrooms', { credentials: 'include' });
    return resp.json();
}

export async function getMessagesForChatroom(name) {
    const resp = await fetch(`/api/chatroom/${encodeURIComponent(name)}`, { credentials: 'include' });
    return resp.json();
}

// For sending messages, assume we have `csrfToken` set globally
import { csrfToken } from './userApi.js';

export async function sendMessage(chatroomName, message, file) {
    const formData = new FormData();
    formData.append('message', message);
    if (file) {
        formData.append('message_image', file);
    }

    const headers = {};
    if (csrfToken) {
        headers['X-CSRF-Token'] = csrfToken;
    }

    const resp = await fetch(`/api/chatroom/${encodeURIComponent(chatroomName)}/sendMessage`, {
        method: 'POST',
        headers,
        body: formData,
        credentials: 'include'
    });
    return resp.json();
}
