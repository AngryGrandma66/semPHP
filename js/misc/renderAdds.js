export function renderChatrooms(chatroomList, chatrooms) {
    // Clear existing chatrooms
    chatroomList.innerHTML = '';

    if (chatrooms.length === 0) {
        chatroomList.innerHTML = '<p>No chatrooms found.</p>';
        return;
    }

    const ul = document.createElement('ul'); // Create a list to hold chatrooms

    for (const chatroom of chatrooms) {
        const li = document.createElement('li');
        const link = document.createElement('a');
        link.href = '/chatroom/' + encodeURIComponent(chatroom.name);
        link.textContent = chatroom.name;
        li.appendChild(link);
        ul.appendChild(li);
    }

    chatroomList.appendChild(ul);
}
