import {
    getChatroomByName,
    getChatrooms,
    getLatestMessages,
    getMessagesForChatroom,
    sendMessage
} from "../api/chatApi.js";
import {renderChatrooms} from "../misc/renderAdds.js";

export async function renderView() {
    let pageURL = window.location.href;
    let chatroomNameFromUrl = pageURL.substring(pageURL.lastIndexOf('/') + 1);
    const content = document.getElementById('content');
    const title = document.querySelector('title');
    const exist = await getChatroomByName(chatroomNameFromUrl)
    if (!exist.success) {
        title.innerText ='not found';
        content.innerHTML = '<p>This chatroom does not exist</p>';
        return;
    }

    title.innerText = chatroomNameFromUrl;

    content.innerHTML = `
    <aside>
    <input type="text" id="chatroomSearch" name="chatroomSearch" class="chatroomSearch" placeholder="searchbar">
    <div id="asideChatroomList"></div>
    </aside>
    <span id="chatroomTitle"></span>
    <div class="messageBoxWrapper">
    <button id="loadMoreButton" class="button">Load more </button>
    <div class = "messageBox" id="messageBox">
    
    
    
    </div>
    
    
    
    
 <form id="sendMessageForm">
    <input type="text" name="sendMessageInput" id="sendMessageInput" class="messageSearch" placeholder="sendMessage">
    <span id="senMessageError" class="error"></span>
        <input type="file"
        name="messagePic" 
        accept=".webp, .png, .jpeg, .jpg" 
        id="messagePic"
        alt="profile pic upload"
        />
        <span id="fileError" class="error"></span>
    <button type="submit">Send</button>
    </form>
    </div>
   
    
    
    
    
    
    
    `;
    const chatroomList = document.getElementById('asideChatroomList');
    await getChatrooms('', 0)
        .then(data => {
            if (data.success) {
                renderChatrooms(chatroomList, data.chatrooms);
            } else {
                chatroomList.innerHTML = '<p>No chatrooms found.</p>';
            }
        })

    const searchBar = document.getElementById('chatroomSearch')
    searchBar.addEventListener('keyup', () => {
        getChatrooms(searchBar.value, 0)
            .then(data => {
                    if (data.success) {
                        renderChatrooms(chatroomList, data.chatrooms);
                    } else {
                        chatroomList.innerHTML = '<p>No chatrooms found.</p>';
                    }
                }
            )
    })
    const messageBox = document.getElementById('messageBox');
    let messageOffset = 0
    let savedTimestamp = Math.floor(Date.now() / 1000)


    async function latestMessages() {
        const latestMessages = await getLatestMessages(savedTimestamp, chatroomNameFromUrl)
        if (latestMessages.success) {
            if (latestMessages.messages.length > 0) {
                renderMessages(messageBox,latestMessages.messages);
                messageOffset += latestMessages.messages.length;
            }
            savedTimestamp = Math.floor(Date.now() / 1000)
        }
    }

    async function loadMessages(prepend = false) {

        if (!chatroomNameFromUrl) {

            return;
        }
        if (!prepend) {
            await latestMessages()
        }
        const data = await getMessagesForChatroom(chatroomNameFromUrl, messageOffset)
        if (data.success) {
            if (data.messages.length > 0) {
                renderMessages(messageBox,data.messages, !prepend);
                messageOffset += data.messages.length;
            } else {
                loadMoreButton.disabled = true;
                loadMoreButton.textContent = 'No more messages';
            }
        } else {
            console.error('Error loading messages:', data.error);
        }
    }

    const loadMoreButton = document.getElementById('loadMoreButton');


    loadMoreButton.addEventListener('click', function () {
        loadMessages();
    })


    const messageInput = document.getElementById('sendMessageInput');
    const fileInput = document.getElementById('messagePic');
    const sendMessageForm = document.getElementById('sendMessageForm');

    sendMessageForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!chatroomNameFromUrl) {
                return;
            }

            const message = messageInput.value.trim();
            if (message === '') {
                return;
            }

            const file = fileInput.files?.[0] || null;

            await sendMessage(chatroomNameFromUrl, message, file);
            messageInput.value = '';
            fileInput.value = '';

            savedTimestamp = Math.floor(Date.now() / 1000)
            await latestMessages()
        }
    )
    await loadMessages(false)
}

function renderMessages(root,messages, prepend = false) {

    messages.forEach(function (message) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        const profilePic = document.createElement('img');

        profilePic.src = message.pathtopfp;
        profilePic.alt = 'Profile Picture';
        profilePic.classList.add('profile-pic');
        messageDiv.appendChild(profilePic);
        const messageContentDiv = document.createElement('div');

        messageContentDiv.classList.add('message-content');
        const usernameDiv = document.createElement('div');

        usernameDiv.classList.add('username');
        console.log(message)
        if (message.username) {

            const usernameLink = document.createElement('a');
            usernameLink.href = '/profile/' + encodeURIComponent(message.username);
            const usernameText = document.createElement('div');
            usernameText.textContent = message.username;
            usernameLink.appendChild(usernameText);
            usernameDiv.appendChild(usernameLink);
        } else {
            const anonText = document.createElement('div');
            anonText.textContent = 'anonymous';
            usernameDiv.appendChild(anonText);
        }
        messageContentDiv.appendChild(usernameDiv);
        const messageTextDiv = document.createElement('div');

        messageTextDiv.classList.add('message-text');
        messageTextDiv.textContent = message.message;
        messageContentDiv.appendChild(messageTextDiv);
        const timestampDiv = document.createElement('div');


        if (message.pathtoimage) {
            const messageImage = document.createElement('img');
            messageImage.src = message.pathtoimage;
            messageImage.alt = 'Message image ';
            messageImage.classList.add('message-image');
            messageDiv.appendChild(messageImage);
        }
        timestampDiv.classList.add('timestamp');
        timestampDiv.textContent = message.timestamp;
        messageContentDiv.appendChild(timestampDiv);
        messageDiv.appendChild(messageContentDiv);

        if (prepend) {

            root.insertBefore(messageDiv, root.firstChild);
        } else {
            root.appendChild(messageDiv);
        }
    });
}
