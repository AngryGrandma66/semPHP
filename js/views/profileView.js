
import { getUserByName, getCurrentUser } from "../api/userApi.js";
import { sanitize } from "../misc/utils.js";
import {editUserMessage, getUserMessages} from "../api/profileApi.js";

export async function renderView() {
    const pageURL = window.location.href;
    const userFromUrl = decodeURIComponent(pageURL.substring(pageURL.lastIndexOf('/') + 1));

    const title = document.querySelector('title');
    const content = document.getElementById('content');

    const userResponse = await getUserByName(userFromUrl);

    if (!userResponse.success) {
        title.innerText = 'User Not Found';
        content.innerHTML = '';
        const errorMessage = document.createElement('p');
        errorMessage.textContent = 'This user does not exist.';
        errorMessage.classList.add('error-message');
        content.appendChild(errorMessage);
        return;
    }

    const userData = userResponse.user;
    title.innerText = userFromUrl;

    content.innerHTML = '';

    // Profile Information
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
    emailElement.innerText = `Email: ${sanitize(userResponse.user.email)}`;
    profileBox.appendChild(emailElement);

    const roleElement = document.createElement('p');
    roleElement.id = 'role';
    roleElement.innerHTML = `Role: ${sanitize(userResponse.user.role)}`;
    profileBox.appendChild(roleElement);

    content.appendChild(profileBox);

    // Fetch current user data to determine if viewing own profile
    const currentUserResponse = await getCurrentUser();
    const isOwnProfile = currentUserResponse.success && currentUserResponse.user === userFromUrl;

    if (isOwnProfile) {
        // Messages Section
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
        let totalMessages = 0;
        let totalPages = 1;

        /**
         * Loads messages for the current user with pagination.
         * @param {number} page - The current page number.
         */
        async function loadUserMessages(page) {
            userMessagesList.innerHTML = '<p>Loading messages...</p>';
            const offset = (page - 1) * limit;
            const resp = await getUserMessages(userFromUrl, offset, limit);
            userMessagesList.innerHTML = '';

            if (!resp.success) {
                userMessagesList.innerHTML = `<p>${resp.error || 'No messages found.'}</p>`;
                messagesPaginationBar.innerHTML = '';
                return;
            }

            const messages = resp.messages;
            totalMessages = resp.total;
            totalPages = Math.ceil(totalMessages / limit);

            if (messages.length === 0) {
                userMessagesList.innerHTML = '<p>No messages found.</p>';
                messagesPaginationBar.innerHTML = '';
                return;
            }

            messages.forEach(message => {
                const messageDiv = document.createElement('div');
                messageDiv.classList.add('user-message');

                const messageContent = document.createElement('p');
                messageContent.textContent = sanitize(message.message);
                messageContent.classList.add('message-text');
                messageDiv.appendChild(messageContent);

                const timestamp = document.createElement('span');
                timestamp.textContent = message.timestamp; // Already formatted by backend
                timestamp.classList.add('message-timestamp');
                messageDiv.appendChild(timestamp);

                // Edit Button
                const editButton = document.createElement('button');
                editButton.textContent = 'Edit';
                editButton.classList.add('edit-message-button');
                editButton.dataset.messageId = message.id;
                editButton.addEventListener('click', () => {
                    handleEditMessage(message.id, message.message, messageDiv);
                });
                messageDiv.appendChild(editButton);

                userMessagesList.appendChild(messageDiv);
            });

            renderPagination(page, totalPages);
        }

        /**
         * Renders pagination controls.
         * @param {number} page - The current page number.
         * @param {number} total - The total number of pages.
         */
        function renderPagination(page, total) {
            messagesPaginationBar.innerHTML = '';

            // Prev Button
            if (page > 1) {
                const prevBtn = document.createElement('button');
                prevBtn.textContent = 'Prev';
                prevBtn.addEventListener('click', () => {
                    currentPage = page - 1;
                    loadUserMessages(currentPage);
                });
                messagesPaginationBar.appendChild(prevBtn);
            }

            // Page Numbers
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

            // Next Button
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

        /**
         * Handles editing a message.
         * @param {number} messageId - The ID of the message to edit.
         * @param {string} currentText - The current text of the message.
         * @param {HTMLElement} messageDiv - The DOM element of the message.
         */
        async function handleEditMessage(messageId, currentText, messageDiv) {
            // Replace message text with an input field
            const messageContent = messageDiv.querySelector('.message-text');
            const editButton = messageDiv.querySelector('.edit-message-button');

            if (!messageContent) {
                console.error('Message content element not found.');
                return;
            }

            if (!editButton) {
                console.error('Edit button element not found.');
                return;
            }

            const inputField = document.createElement('input');
            inputField.type = 'text';
            inputField.value = currentText;
            inputField.classList.add('edit-message-input');

            // Replace the message content with the input field
            try {
                messageDiv.replaceChild(inputField, messageContent);
            } catch (error) {
                console.error('Error replacing message content:', error);
                return;
            }

            // Change Edit button to Save and add Cancel button
            editButton.textContent = 'Save';

            const cancelButton = document.createElement('button');
            cancelButton.textContent = 'Cancel';
            cancelButton.classList.add('cancel-edit-button');

            editButton.parentNode.insertBefore(cancelButton, editButton.nextSibling);

            // Handle Save Action
            editButton.onclick = async () => {
                const newText = inputField.value.trim();
                if (newText === '') {
                    alert('Message cannot be empty.');
                    return;
                }

                const resp = await editUserMessage(messageId, newText);
                if (resp.success) {
                    // Update message text in UI
                    const newMessageContent = document.createElement('p');
                    newMessageContent.textContent = sanitize(newText);
                    newMessageContent.classList.add('message-text');

                    try {
                        messageDiv.replaceChild(newMessageContent, inputField);
                    } catch (error) {
                        console.error('Error replacing input field with new message content:', error);
                        return;
                    }

                    // Restore Edit button
                    editButton.textContent = 'Edit';
                    editButton.onclick = () => handleEditMessage(messageId, newText, messageDiv);

                    // Remove Cancel button
                    cancelButton.remove();
                } else {
                    alert(resp.error || 'Failed to update message.');
                }
            };

            // Handle Cancel Action
            cancelButton.addEventListener('click', () => {
                // Restore original message text
                const originalMessageContent = document.createElement('p');
                originalMessageContent.textContent = sanitize(currentText);
                originalMessageContent.classList.add('message-text');
                try {
                    messageDiv.replaceChild(originalMessageContent, inputField);
                } catch (error) {
                    console.error('Error replacing input field with original message content:', error);
                    return;
                }

                // Restore Edit button
                editButton.textContent = 'Edit';
                editButton.onclick = () => handleEditMessage(messageId, currentText, messageDiv);

                // Remove Cancel button
                cancelButton.remove();
            });
        }

        await loadUserMessages(currentPage);
    }
}
