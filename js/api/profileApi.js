import {getJsonHeaders} from "../misc/utils.js";

export async function getUserMessages(username, offset, limit = 10) {
    const resp = await fetch(`/api/getUserMessages?username=${encodeURIComponent(username)}&offset=${offset}&limit=${limit}`, {
        method: 'GET',
        credentials: 'include'
    });
    return resp.json();
}

export async function editUserMessage(messageId, newText) {
    const resp = await fetch('/api/editMessage', {
        method: 'POST',
        headers: getJsonHeaders(),
        credentials: 'include',
        body: JSON.stringify({ messageId, message: newText })
    });
    return resp.json();
}