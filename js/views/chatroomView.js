import {
    getChatroomByName,
    getLatestMessages,
    getMessagesForChatroom,
    sendMessage,
    getChatrooms
} from "../api/chatApi.js";
import {renderChatrooms, renderFancyPagination} from "../misc/renderAdds.js";

export async function renderView() {
    let pageURL = window.location.href;
    let chatroomNameFromUrl = decodeURIComponent(pageURL.substring(pageURL.lastIndexOf('/') + 1));
    const content = document.getElementById('content');
    const title = document.querySelector('title');

    const exist = await getChatroomByName(chatroomNameFromUrl);
    if (!exist.success) {
        title.innerText = 'not found';
        content.innerHTML = '<p>This chatroom does not exist</p>';
        return;
    }

    title.innerText = chatroomNameFromUrl;

    content.innerHTML = `
    <div id="chatroomView">
      <aside>
          <input type="text" id="chatroomSearch"
                 name="chatroomSearch" class="chatroomSearch"
                 placeholder="searchbar" />
          <div id="asideChatroomList"></div>
          <div id="asideChatroomPaginationBar" class="pagination-bar"></div>
      </aside>

      <div class="chatAreaWrapper">
          <button id="loadMoreButton" class="button">Load more</button>
          <div class="messageBox" id="messageBox"></div>

          <form id="sendMessageForm">
              <input type="text"
                     name="sendMessageInput"
                     id="sendMessageInput"
                     class="messageSearch"
                     placeholder="sendMessage"
                     maxlength="1000" />
              <span id="senMessageError" class="error"></span>

              <input type="file"
                     name="messagePic"
                     accept=".webp, .png, .jpeg, .jpg"
                     id="messagePic" />
              <span id="fileError" class="error"></span>
              <label for="messagePic" class="labelFile">Attach image</label>
<span class="fileNameDisplay" id="chatFileName"></span>
              <button type="submit">Send</button>
          </form>
      </div>
    </div>
`;

    const chatroomList = document.getElementById('asideChatroomList');
    const searchBar = document.getElementById('chatroomSearch');
    const paginationBar = document.getElementById('asideChatroomPaginationBar');

    let currentFilter = '';
    let currentPage = 1;
    let totalPages = 1;

    async function loadAsideChatrooms(page, filter) {
        chatroomList.innerHTML = '';

        const resp = await getChatrooms(filter, page);
        if (!resp.success) {
            chatroomList.innerHTML = `<p>${resp.error || 'No chatrooms found.'}</p>`;
            paginationBar.innerHTML = '';
            return;
        }

        renderChatrooms(chatroomList, resp.chatrooms);
        totalPages = Math.ceil(resp.total / 10);

        renderFancyPagination(
            paginationBar,
            page,
            totalPages,
            (pageNum) => {
                currentPage = pageNum;
                loadAsideChatrooms(currentPage, currentFilter);
            }
        );
    }

    await loadAsideChatrooms(currentPage, currentFilter);

    searchBar.addEventListener('keyup', () => {
        currentFilter = searchBar.value;
        currentPage = 1;
        loadAsideChatrooms(currentPage, currentFilter);
    });

    const messageBox = document.getElementById('messageBox');
    let messageOffset = 0;
    let savedTimestamp = Math.floor(Date.now() / 1000);
    const displayedIds = new Set();

    async function latestMessages() {
        const latestMessages = await getLatestMessages(savedTimestamp, chatroomNameFromUrl);
        if (latestMessages.success) {
            if (latestMessages.messages.length > 0) {
                renderMessages(messageBox, latestMessages.messages,displayedIds);
                messageOffset += latestMessages.messages.length;
            }
            savedTimestamp = Math.floor(Date.now() / 1000);
        }
    }

    async function loadMessages(prepend = false) {
        if (!chatroomNameFromUrl) {
            return;
        }
        const data = await getMessagesForChatroom(chatroomNameFromUrl, messageOffset);
        if (data.success) {
            if (data.messages.length > 0) {
                renderMessages(messageBox, data.messages,displayedIds, !prepend);
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
    });

    const messageInput = document.getElementById('sendMessageInput');
    const fileInput = document.getElementById('messagePic');
    const sendMessageForm = document.getElementById('sendMessageForm');
    const fileNameDisplay = document.getElementById('chatFileName');

    fileInput.addEventListener('change', () => {
        if(fileInput.files && fileInput.files.length > 0) {
            fileNameDisplay.textContent = fileInput.files[0].name;
        } else {
            fileNameDisplay.textContent = '';
        }
    });

    sendMessageForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!chatroomNameFromUrl) {
            return;
        }

        const message = messageInput.value.trim();

        const file = fileInput.files?.[0] || null;
        await sendMessage(chatroomNameFromUrl, message, file);
        messageInput.value = '';
        fileInput.value = '';

        await latestMessages();
    });

    await loadMessages(false);
    setInterval(async () => {
        await latestMessages();
    }, 1000);
}

function renderMessages(root, messages,displayedIds, prepend = false) {
    const newMessages = [];
    for (const msg of messages) {
        if (!displayedIds.has(msg.id)) {
            displayedIds.add(msg.id);
            newMessages.push(msg);
        }
    }

    newMessages.forEach(function (message) {
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

        if (message.username) {
            const usernameLink = document.createElement('a');
            usernameLink.href = '/profile/' + encodeURIComponent(message.username);
            usernameLink.textContent = message.username;
            usernameDiv.appendChild(usernameLink);
        } else {
            usernameDiv.textContent = 'anonymous';
        }
        messageContentDiv.appendChild(usernameDiv);

        const messageTextDiv = document.createElement('div');
        messageTextDiv.classList.add('message-text');
        messageTextDiv.textContent = message.message;
        messageContentDiv.appendChild(messageTextDiv);

        if (message.pathtoimage) {
            const messageImage = document.createElement('img');
            messageImage.src = message.pathtoimage;
            messageImage.alt = 'Message image';
            messageImage.classList.add('message-image');
            messageContentDiv.appendChild(messageImage);
        }

        const timestampDiv = document.createElement('div');
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
