import {getJsonHeaders} from "../misc/utils.js";

export async function getChatrooms(filter, page = 1) {
    const offset = (page - 1) * 10;
    const resp = await fetch(`/api/getChatrooms?filter=${encodeURIComponent(filter)}&offset=${offset}`, {
        method: 'GET',
        credentials: 'include',
    });
    return resp.json();
    // The response now includes: { success: true, chatrooms: [...], total: 123 }
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

export async function getMessagesForChatroom(name, messageOffset) {
    const resp = await fetch(`/api/getChatroomMessages?chatroom=${encodeURIComponent(name)}&offset=${messageOffset}`, {
        method: 'GET',
        credentials: 'include'
    });

    return resp.json();
}

export async function sendMessage(chatroomName, message, file) {
    const formData = new FormData();
    formData.append('message', message);
    if (file) {
        formData.append('message_image', file);
    }

    const resp = await fetch(`/api/chatroom/${encodeURIComponent(chatroomName)}/sendMessage`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
    });
    return resp.json();
}
export async function getLatestMessages(timestamp, chatroomName) {
    const resp = await fetch(`/api/getLatestMessages?timestamp=${timestamp}&chatroomName=${encodeURIComponent(chatroomName)}`, {
        method: 'GET',
        credentials: 'include'
    })
    return resp.json();
}


export async function getChatroomByName(chatroomName) {
    const resp = await fetch(`/api/getChatroomByName?name=${encodeURIComponent(chatroomName)}`, {
        method: 'GET',
        credentials: 'include'
    })
    return resp.json();
}
