// /js/views/profileView.js

import {getUserByName, getCurrentUser} from "../api/userApi.js";
import {getUserMessages, editUserMessage} from "../api/profileApi.js";
import {sanitize} from "../misc/utils.js";

export async function renderView() {
    const content = document.getElementById('content');
    content.innerHTML = ''; // Clear previous content
    const pageTitle = document.querySelector('title');

    // 1) Grab the username from the URL
    const pageURL = window.location.href;
    const userFromUrl = decodeURIComponent(pageURL.substring(pageURL.lastIndexOf('/') + 1));

    // 2) Fetch the user data
    const userResponse = await getUserByName(userFromUrl);
    if (!userResponse.success) {
        pageTitle.innerText = 'User Not Found';
        content.innerHTML = '<p>This user does not exist.</p>';
        return;
    }

    // 3) Display basic profile info
    const userData = userResponse.user;
    pageTitle.innerText = userData.username; // Use the actual username from the server

    const profileBox = document.createElement('div');
    profileBox.id = 'profileBox';
    profileBox.classList.add('profileBox');

    // Profile Pic
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
    roleElement.innerHTML = `Role: ${sanitize(userData.role)}`;
    profileBox.appendChild(roleElement);

    content.appendChild(profileBox);

    // 4) Determine if this is the current user's own profile
    const currentUserResp = await getCurrentUser();
    const isOwnProfile = currentUserResp.success && currentUserResp.user === userData.username;

    // If not the owner of the profile, we don't show messages
    if (!isOwnProfile) {
        return;
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

    // 5a) Function: load messages from the backend
    async function loadUserMessages(page) {
        // Show a temporary loading state
        userMessagesList.innerHTML = '<p>Loading messages...</p>';

        const offset = (page - 1) * limit;
        const response = await getUserMessages(userData.username, offset, limit);

        // Clear out the list again
        userMessagesList.innerHTML = '';

        if (!response.success) {
            userMessagesList.innerHTML = `<p>${response.error || 'Error fetching messages.'}</p>`;
            messagesPaginationBar.innerHTML = '';
            return;
        }

        const {messages, total} = response;
        if (!messages || messages.length === 0) {
            userMessagesList.innerHTML = '<p>No messages found.</p>';
            messagesPaginationBar.innerHTML = '';
            return;
        }

        // Calculate total pages
        totalPages = Math.ceil(total / limit);

        // Render each message
        messages.forEach(msg => {
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('user-message');

            // The text
            const messageText = document.createElement('p');
            messageText.textContent = sanitize(msg.message);
            messageText.classList.add('message-text');
            messageDiv.appendChild(messageText);

            // Timestamp
            const timestampSpan = document.createElement('span');
            timestampSpan.textContent = msg.timestamp; // Already formatted by backend
            timestampSpan.classList.add('message-timestamp');
            messageDiv.appendChild(timestampSpan);

            // Edit button
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Edit';
            editBtn.classList.add('edit-button');
            editBtn.addEventListener('click', () => {
                handleEditMessage(msg.id, msg.message, messageDiv);
            });
            messageDiv.appendChild(editBtn);

            userMessagesList.appendChild(messageDiv);
        });

        // Render pagination
        renderPagination(page, totalPages);
    }

    // 5b) Function: Render pagination (Prev, 1..N, Next)
    function renderPagination(page, total) {
        messagesPaginationBar.innerHTML = '';

        // Prev
        if (page > 1) {
            const prevBtn = document.createElement('button');
            prevBtn.textContent = 'Prev';
            prevBtn.addEventListener('click', () => {
                currentPage = page - 1;
                loadUserMessages(currentPage);
            });
            messagesPaginationBar.appendChild(prevBtn);
        }

        // Pages 1..N
        for (let p = 1; p <= total; p++) {
            const pageBtn = document.createElement('button');
            pageBtn.textContent = p.toString();
            if (p === page) {
                pageBtn.disabled = true;
            }
            pageBtn.addEventListener('click', () => {
                currentPage = p;
                loadUserMessages(currentPage);
            });
            messagesPaginationBar.appendChild(pageBtn);
        }

        // Next
        if (page < total) {
            const nextBtn = document.createElement('button');
            nextBtn.textContent = 'Next';
            nextBtn.addEventListener('click', () => {
                currentPage = page + 1;
                loadUserMessages(currentPage);
            });
            messagesPaginationBar.appendChild(nextBtn);
        }
    }

    // 5c) Function: Handle editing a single message
    async function handleEditMessage(messageId, oldText, messageDiv) {
        // Locate the p.message-text element
        const messageTextEl = messageDiv.querySelector('.message-text');

        // Replace it with an input field
        const inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.value = oldText;
        inputField.classList.add('edit-message-input');

        // Buttons
        const saveBtn = document.createElement('button');
        saveBtn.textContent = 'Save';

        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancel';

        // We'll store the old text in case user cancels
        const oldMessageText = messageTextEl.cloneNode(true);

        // Replace the old p with the input
        messageDiv.replaceChild(inputField, messageTextEl);

        // Add the buttons (save/cancel) in place of the old "Edit" button
        const editBtn = messageDiv.querySelector('.edit-button');
        editBtn.style.display = 'none'; // Hide the old Edit button for now

        messageDiv.appendChild(saveBtn);
        messageDiv.appendChild(cancelBtn);

        // Save logic
        saveBtn.addEventListener('click', async () => {
            const newText = inputField.value.trim();
            if (!newText) {
                alert('Message cannot be empty.');
                return;
            }

            // Attempt to edit on the server
            const resp = await editUserMessage(messageId, newText);
            if (resp.success) {
                // If success, update the UI
                const updatedP = document.createElement('p');
                updatedP.classList.add('message-text');
                updatedP.textContent = newText;
                messageDiv.replaceChild(updatedP, inputField);
            } else {
                alert(resp.error || 'Could not update message.');
                return;
            }

            // Cleanup
            editBtn.style.display = 'inline-block';
            saveBtn.remove();
            cancelBtn.remove();
        });

        // Cancel logic
        cancelBtn.addEventListener('click', () => {
            // Revert to old text
            messageDiv.replaceChild(oldMessageText, inputField);
            editBtn.style.display = 'inline-block';
            saveBtn.remove();
            cancelBtn.remove();
        });
    }

    await loadUserMessages(currentPage);
}
