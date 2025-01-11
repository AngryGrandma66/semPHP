import {getUserByName, getCurrentUser} from "../api/userApi.js";
import {getUserMessages, editUserMessage} from "../api/profileApi.js";
import {sanitize} from "../misc/utils.js";
import {renderFancyPagination} from "../misc/renderAdds.js";

export async function renderView() {
    const content = document.getElementById('content');
    content.innerHTML = '';
    const pageTitle = document.querySelector('title');

    const pageURL = window.location.href;
    const userFromUrl = decodeURIComponent(pageURL.substring(pageURL.lastIndexOf('/') + 1));

    const userResponse = await getUserByName(userFromUrl);
    if (!userResponse.success) {
        pageTitle.innerText = 'User Not Found';
        content.innerHTML = '<p>This user does not exist.</p>';
        return;
    }

    const userData = userResponse.user;
    pageTitle.innerText = userData.username;

    const profileBox = document.createElement('div');
    profileBox.id = 'profileBox';
    profileBox.classList.add('profileBox');

    const profilePic = document.createElement('img');
    profilePic.src = userData.pathtopfp;
    profilePic.alt = `${sanitize(userData.username)}'s Profile Picture`;
    profilePic.classList.add('profile-pic');
    profileBox.appendChild(profilePic);

    const usernameElement = document.createElement('h2');
    usernameElement.id = 'username';
    usernameElement.textContent = sanitize(userData.username);
    profileBox.appendChild(usernameElement);

    const emailElement = document.createElement('p');
    emailElement.id = 'email';
    emailElement.innerText = `Email: ${sanitize(userData.email)}`;
    profileBox.appendChild(emailElement);

    const roleElement = document.createElement('p');
    roleElement.id = 'role';
    roleElement.innerText = `Role: ${sanitize(userData.role)}`;
    profileBox.appendChild(roleElement);

    content.appendChild(profileBox);

    const currentUserResp = await getCurrentUser();
    const isOwnProfile = currentUserResp.success && currentUserResp.user === userData.username;
    if (!isOwnProfile) {
        return;
    }

    const messagesSection = document.createElement('div');
    messagesSection.id = 'userMessagesSection';
    messagesSection.innerHTML = `
        <h3>Your Messages</h3>
        <div id="userMessagesList"></div>
        <div id="userMessagesPaginationBar" class="pagination-bar"></div>
    `;
    content.appendChild(messagesSection);

    const userMessagesList = document.getElementById('userMessagesList');
    const messagesPaginationBar = document.getElementById('userMessagesPaginationBar');

    let currentPage = 1;
    const limit = 10;
    let totalPages = 1;

    async function loadUserMessages(page) {
        userMessagesList.innerHTML = '<p>Loading messages...</p>';

        const offset = (page - 1) * limit;
        const resp = await getUserMessages(userData.username, offset, limit);

        userMessagesList.innerHTML = '';

        if (!resp.success) {
            userMessagesList.innerHTML = `<p>${resp.error || 'Error fetching messages.'}</p>`;
            messagesPaginationBar.innerHTML = '';
            return;
        }

        const {messages, total} = resp;
        if (!messages || messages.length === 0) {
            userMessagesList.innerHTML = '<p>No messages found.</p>';
            messagesPaginationBar.innerHTML = '';
            return;
        }

        totalPages = Math.ceil(total / limit);

        messages.forEach((msg) => {
            const messageDiv = document.createElement('div');

            console.log(msg)
            messageDiv.classList.add('user-message');

            const userPfpImg = document.createElement('img');
            userPfpImg.src = msg.pathtopfp || '/images/assets/anonPfp.webp';
            userPfpImg.classList.add('user-pfp-in-message');
            messageDiv.appendChild(userPfpImg);

            const messageText = document.createElement('p');
            messageText.textContent = sanitize(msg.message);
            messageText.classList.add('message-text');
            messageDiv.appendChild(messageText);
            if (msg.pathtoimage) {
                const messageImage = document.createElement('img');
                messageImage.src = msg.pathtoimage;
                messageImage.classList.add('message-image');
                messageDiv.appendChild(userPfpImg);
            }
            const timestampSpan = document.createElement('span');
            timestampSpan.textContent = msg.timestamp;
            timestampSpan.classList.add('message-timestamp');
            messageDiv.appendChild(timestampSpan);

            const editBtn = document.createElement('button');
            editBtn.textContent = 'Edit';
            editBtn.classList.add('edit-button');
            editBtn.addEventListener('click', () => {
                handleEditMessage(msg.id, msg.message, messageDiv, editBtn);
            });
            messageDiv.appendChild(editBtn);

            userMessagesList.appendChild(messageDiv);
        });

        renderFancyPagination(
            messagesPaginationBar,
            page,
            totalPages,
            (newPage) => {
                currentPage = newPage;
                loadUserMessages(currentPage);
            }
        );
    }

    function handleEditMessage(messageId, oldText, messageDiv, editBtn) {
        const oldTextEl = messageDiv.querySelector('.message-text');
        if (!oldTextEl) return;

        const inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.value = oldText;
        inputField.classList.add('edit-message-input');

        const saveBtn = document.createElement('button');
        saveBtn.textContent = 'Save';

        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancel';

        messageDiv.replaceChild(inputField, oldTextEl);
        editBtn.style.display = 'none';

        messageDiv.appendChild(saveBtn);
        messageDiv.appendChild(cancelBtn);

        saveBtn.addEventListener('click', async () => {
            const newText = inputField.value.trim();
            if (!newText) {
                alert('Message cannot be empty.');
                return;
            }
            const resp = await editUserMessage(messageId, newText);
            if (!resp.success) {
                alert(resp.error || 'Could not update message.');
                return;
            }

            const updatedTextP = document.createElement('p');
            updatedTextP.textContent = newText;
            updatedTextP.classList.add('message-text');
            messageDiv.replaceChild(updatedTextP, inputField);

            editBtn.style.display = 'inline-block';
            saveBtn.remove();
            cancelBtn.remove();
        });

        cancelBtn.addEventListener('click', () => {
            messageDiv.replaceChild(oldTextEl, inputField);
            editBtn.style.display = 'inline-block';
            saveBtn.remove();
            cancelBtn.remove();
        });
    }

    await loadUserMessages(currentPage);
}
