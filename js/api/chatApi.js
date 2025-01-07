import {csrfToken, getJsonHeaders} from "../misc/utils.js";

export async function getChatrooms(filter,offset) {
    const resp = await fetch(`/api/getChatrooms?filter=${filter}&offset=${offset}`, {
        method: 'GET',
        credentials: 'include',
    });
    return resp.json();
}

export async function addChatroom(chatroomName) {

    const resp = await fetch(`/api/addChatroom`, {
        method: 'POST',
        headers: getJsonHeaders(),
        body: JSON.stringify(chatroomName),
        credentials: 'include',
    })
    return resp.json();

}

export async function getMessagesForChatroom(name,messageOffset) {
    const resp = await fetch(`/api/chatroom?chatroom=${name}&offset=${messageOffset}`, {credentials: 'include'});
    return resp.json();
}

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
