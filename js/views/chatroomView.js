import {getCurrentUser} from "../api/userApi.js";
import {getChatrooms, getLatestMessages, getMessagesForChatroom, sendMessage} from "../api/chatApi.js";
import {renderChatrooms} from "../misc/renderAdds.js";

export async function renderView() {
    const content = document.getElementById('content');
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
    <input type="text" name="SendMessageInput" id="SendMessageInput" class="messageSearch" placeholder="sendMessage">
    <span id="senMessageError" class="error"></span>
        <input type="file"
        name="messagePic" 
        accept=".webp, .png, .jpeg, .jpg" 
        id="messagePic"
        alt="profile pic upload"
        required
        />
        <span id="fileError" class="error"></span>
    <button type="submit">Send</button>
    </form>
    </div>
   
    
    
    
    
    
    
    `;

    const chatroomList = document.getElementById('asideChatroomList');

    const userData = await getCurrentUser();

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
    let pageURL = window.location.href;
    let chatroomNameFromUrl = pageURL.substring(pageURL.lastIndexOf('/') + 1);

    const messageBox = document.getElementById('messageBox');
    let messageOffset = 0
    let savedTimestamp = 0

    function renderMessages(messages, prepend = false) {

        messages.forEach(function (message) {
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message');
            const profilePic = document.createElement('img');

            profilePic.src = message.pathtoimage;
            profilePic.alt = 'Profile Picture';
            profilePic.classList.add('profile-pic');
            messageDiv.appendChild(profilePic);
            const messageContentDiv = document.createElement('div');

            messageContentDiv.classList.add('message-content');
            const usernameDiv = document.createElement('div');

            usernameDiv.classList.add('username');
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

            timestampDiv.classList.add('timestamp');
            timestampDiv.textContent = message.timestamp;
            messageContentDiv.appendChild(timestampDiv);
            messageDiv.appendChild(messageContentDiv);

            if (prepend) {

                messageBox.insertBefore(messageDiv, messageBox.firstChild);
            } else {
                messageBox.appendChild(messageDiv);
            }
        });
    }

    function loadMessages(initialLoad = false) {

        if (!chatroomNameFromUrl) {

            return;
        }
        if (!initialLoad) {
            const latestMessages = getLatestMessages(savedTimestamp, chatroomNameFromUrl)
            if (latestMessages.success) {
                if (latestMessages.messages.length > 0) {
                    renderMessages(latestMessages.messages);
                    messageOffset += latestMessages.messages.length;
                }
            }
        }
        const data = getMessagesForChatroom(!chatroomNameFromUrl, messageOffset)
        if (data.success) {
            if (data.messages.length > 0) {
                renderMessages(data.messages, !initialLoad);
                messageOffset += data.messages.length;
            } else {
                loadMoreButton.disabled = true;
                loadMoreButton.textContent = 'No more messages';
            }
            savedTimestamp = Math.floor(Date.now() / 1000)
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

    sendMessageForm.addEventListener('submit', (e) => {
            e.preventDefault();

            if (!chatroomNameFromUrl) {
                return;
            }

            const message = messageInput.value.trim();
            if (message === '') {
                return;
            }

            const file = fileInput.files?.[0] || null;

            const lastMessage = sendMessage(chatroomNameFromUrl, message, file);
            if (lastMessage.success) {
                messageInput.value = '';
                renderMessages([lastMessage.message]);
                messageOffset++;
            } else {
                alert('Error: ' + lastMessage.error);
            }
        }
    )
}
