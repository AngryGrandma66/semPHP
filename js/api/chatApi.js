import {getJsonHeaders,basePath} from "../misc/utils.js";

export async function getChatrooms(filter, page = 1) {
    const offset = (page - 1) * 10;
    const resp = await fetch(basePath +`api/getChatrooms?filter=${encodeURIComponent(filter)}&offset=${offset}`, {
        method: 'GET',
        credentials: 'include',
    });
    return resp.json();
}
export async function addChatroom(chatroomName) {

    const resp = await fetch(basePath +`api/addChatroom`, {
        method: 'POST',
        headers: getJsonHeaders(),
        body: JSON.stringify(chatroomName),
        credentials: 'include',
    })
    return resp.json();

}

export async function getMessagesForChatroom(name, messageOffset) {
    const resp = await fetch(basePath +`api/getChatroomMessages?chatroom=${encodeURIComponent(name)}&offset=${messageOffset}`, {
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

    const resp = await fetch(basePath +`api/chatroom/${encodeURIComponent(chatroomName)}/sendMessage`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
    });
    return resp.json();
}
export async function getLatestMessages(timestamp, chatroomName) {
    const resp = await fetch(basePath +`api/getLatestMessages?timestamp=${timestamp}&chatroomName=${encodeURIComponent(chatroomName)}`, {
        method: 'GET',
        credentials: 'include'
    })
    return resp.json();
}


export async function getChatroomByName(chatroomName) {
    const resp = await fetch(basePath +`api/getChatroomByName?name=${encodeURIComponent(chatroomName)}`, {
        method: 'GET',
        credentials: 'include'
    })
    return resp.json();
}
