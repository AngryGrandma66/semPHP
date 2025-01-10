// /js/views/profileView.js

import { getUserByName, getCurrentUser } from "../api/userApi.js";
import { getUserMessages, editUserMessage } from "../api/profileApi.js";
import { sanitize } from "../misc/utils.js";
import {renderFancyPagination} from "../misc/renderAdds.js";

export async function renderView() {
    const content = document.getElementById('content');
    content.innerHTML = ''; // Clear any previous content
    const pageTitle = document.querySelector('title');

    // 1) Grab the username from the URL
    const pageURL = window.location.href;
    const userFromUrl = decodeURIComponent(pageURL.substring(pageURL.lastIndexOf('/') + 1));

    // 2) Fetch user data
    const userResponse = await getUserByName(userFromUrl);
    if (!userResponse.success) {
        pageTitle.innerText = 'User Not Found';
        content.innerHTML = '<p>This user does not exist.</p>';
        return;
    }

    // 3) Display basic profile info
    const userData = userResponse.user;
    pageTitle.innerText = userData.username;

    const profileBox = document.createElement('div');
    profileBox.id = 'profileBox';
    profileBox.classList.add('profileBox');

    // Profile pic
    const profilePic = document.createElement('img');
    profilePic.src = userData.pathtopfp;
    profilePic.alt = `${sanitize(userData.username)}'s Profile Picture`;
    profilePic.classList.add('profile-pic');
    profileBox.appendChild(profilePic);

    // Username
    const usernameElement = document.createElement('h2');
    usernameElement.id = 'username';
    usernameElement.textContent = sanitize(userData.username);
    profileBox.appendChild(usernameElement);

    // Email
    const emailElement = document.createElement('p');
    emailElement.id = 'email';
    emailElement.innerText = `Email: ${sanitize(userData.email)}`;
    profileBox.appendChild(emailElement);

    // Role
    const roleElement = document.createElement('p');
    roleElement.id = 'role';
    roleElement.innerText = `Role: ${sanitize(userData.role)}`;
    profileBox.appendChild(roleElement);

    content.appendChild(profileBox);

    // 4) Determine if this is the current user's own profile
    const currentUserResp = await getCurrentUser();
    const isOwnProfile = currentUserResp.success && currentUserResp.user === userData.username;
    if (!isOwnProfile) {
        return; // Not owner => no messages displayed
    }

    // 5) Show the user's messages (pagination + editing)
    const messagesSection = document.createElement('div');
    messagesSection.id = 'userMessagesSection';
    messagesSection.innerHTML = `
        <h3>Your Messages</h3>
        <div id="userMessagesList"></div>
        <div id="userMessagesPaginationBar" class="pagination-bar"></div>
    `;
    content.appendChild(messagesSection);

    // DOM references
    const userMessagesList = document.getElementById('userMessagesList');
    const messagesPaginationBar = document.getElementById('userMessagesPaginationBar');

    // Pagination state
    let currentPage = 1;
    const limit = 10;
    let totalPages = 1;

    async function loadUserMessages(page) {
        // Indicate loading
        userMessagesList.innerHTML = '<p>Loading messages...</p>';

        const offset = (page - 1) * limit;
        const resp = await getUserMessages(userData.username, offset, limit);

        userMessagesList.innerHTML = ''; // Clear

        if (!resp.success) {
            userMessagesList.innerHTML = `<p>${resp.error || 'Error fetching messages.'}</p>`;
            messagesPaginationBar.innerHTML = '';
            return;
        }

        const { messages, total } = resp;
        if (!messages || messages.length === 0) {
            userMessagesList.innerHTML = '<p>No messages found.</p>';
            messagesPaginationBar.innerHTML = '';
            return;
        }

        // Calculate total pages
        totalPages = Math.ceil(total / limit);

        // Render each message
        messages.forEach((msg) => {
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('user-message');

            // Possibly display user pfp for each message
            // if your ChatModel->getMessagesByUser returns userPfp
            // or if each message belongs to the same user anyway
            // Example:
            // const userPfpImg = document.createElement('img');
            // userPfpImg.src = msg.userPfp || '/images/assets/anonPfp.webp';
            // userPfpImg.classList.add('user-pfp-in-message');
            // messageDiv.appendChild(userPfpImg);

            // The text
            const messageText = document.createElement('p');
            messageText.textContent = sanitize(msg.message);
            messageText.classList.add('message-text');
            messageDiv.appendChild(messageText);

            // Timestamp
            const timestampSpan = document.createElement('span');
            timestampSpan.textContent = msg.timestamp;
            timestampSpan.classList.add('message-timestamp');
            messageDiv.appendChild(timestampSpan);

            // Edit button
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Edit';
            editBtn.classList.add('edit-button');
            editBtn.addEventListener('click', () => {
                handleEditMessage(msg.id, msg.message, messageDiv, editBtn);
            });
            messageDiv.appendChild(editBtn);

            userMessagesList.appendChild(messageDiv);
        });

        // Render fancy pagination from utils.js
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

    /**
     * Let user edit their own message inline.
     */
    function handleEditMessage(messageId, oldText, messageDiv, editBtn) {
        // Convert the <p class="message-text"> to an <input>
        const oldTextEl = messageDiv.querySelector('.message-text');
        if (!oldTextEl) return;

        const inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.value = oldText;
        inputField.classList.add('edit-message-input');

        // Create Save/Cancel
        const saveBtn = document.createElement('button');
        saveBtn.textContent = 'Save';

        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancel';

        // Replace old text
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

            // If success
            const updatedTextP = document.createElement('p');
            updatedTextP.textContent = newText;
            updatedTextP.classList.add('message-text');
            messageDiv.replaceChild(updatedTextP, inputField);

            editBtn.style.display = 'inline-block';
            saveBtn.remove();
            cancelBtn.remove();
        });

        cancelBtn.addEventListener('click', () => {
            // Restore old
            messageDiv.replaceChild(oldTextEl, inputField);
            editBtn.style.display = 'inline-block';
            saveBtn.remove();
            cancelBtn.remove();
        });
    }

    // Initial load
await    loadUserMessages(currentPage);
}
