// /js/views/homeView.js
import {getCurrentUser} from '../api/userApi.js';
import {sanitize} from "../misc/utils.js";
import {addChatroom, getChatrooms} from "../api/chatApi.js";
import {renderChatrooms} from "../misc/renderAdds.js";

export async function renderView() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <div id="homeView">
            <span id="homeLoggedInUser"></span>
            
            <input type="text" id="homeChatroomSearch" name="homeChatroomSearch" 
                   class="chatroomSearch" placeholder="searchbar">
            
            <div id="homeChatroomList" class="HomeChatroomList"></div>
            
            <div id="chatroomPaginationBar" class="pagination-bar"></div>
            
        </div>
    `;

    const title = document.querySelector('title');
    title.innerText = 'home';

    const displayedChatrooms = document.getElementById('homeChatroomList');
    const userData = await getCurrentUser();
    const searchBar = document.getElementById('homeChatroomSearch');
    const paginationBar = document.getElementById('chatroomPaginationBar');

    // Display user info
    if (userData.success) {
        document.getElementById('homeLoggedInUser').textContent =
            `You are logged in as ${sanitize(userData.user)}`;
    } else {
        document.getElementById('homeLoggedInUser').textContent = "You are not logged in";
    }

    let currentFilter = '';
    let currentPage = 1;
    let totalPages = 1;

    async function loadChatrooms(page, filter) {
        // Clear the displayed list first
        displayedChatrooms.innerHTML = '';

        const resp = await getChatrooms(filter, page);
        if (!resp.success) {
            displayedChatrooms.innerHTML = `<p>${resp.error || 'No chatrooms found.'}</p>`;
            paginationBar.innerHTML = '';
            return;
        }

        // Render the chatrooms
        renderChatrooms(displayedChatrooms, resp.chatrooms);

        // Calculate total pages
        totalPages = Math.ceil(resp.total / 10);

        // Render the pagination
        renderPagination(page, totalPages);
    }

    function renderPagination(page, total) {
        paginationBar.innerHTML = '';

        // Prev button
        if (page > 1) {
            const prevBtn = document.createElement('button');
            prevBtn.textContent = 'Prev';
            prevBtn.addEventListener('click', () => {
                currentPage = page - 1;
                loadChatrooms(currentPage, currentFilter);
            });
            paginationBar.appendChild(prevBtn);
        }

        // 1.. total
        for (let p = 1; p <= total; p++) {
            const pageBtn = document.createElement('button');
            pageBtn.textContent = p.toString();
            if (p === page) {
                pageBtn.disabled = true;
            }
            pageBtn.addEventListener('click', () => {
                currentPage = p;
                loadChatrooms(currentPage, currentFilter);
            });
            paginationBar.appendChild(pageBtn);
        }

        // Next button
        if (page < total) {
            const nextBtn = document.createElement('button');
            nextBtn.textContent = 'Next';
            nextBtn.addEventListener('click', () => {
                currentPage = page + 1;
                loadChatrooms(currentPage, currentFilter);
            });
            paginationBar.appendChild(nextBtn);
        }
    }

    // Initial load (page=1, filter='')
    await loadChatrooms(currentPage, currentFilter);

    // Search bar event
    searchBar.addEventListener('keyup', () => {
        currentFilter = searchBar.value;
        currentPage = 1;
        loadChatrooms(currentPage, currentFilter);
    });
    if (userData.success) {
        if (userData.role === 'admin' || userData.role === 'owner') {
            const addChatroomForm = document.createElement('form')
            addChatroomForm.id = 'addChatroomForm';
            addChatroomForm.classList.add('addChatroom');
            addChatroomForm.innerHTML = ` 
            <input type="text" name="addChatroomInput" id="addChatroomInput" <input>
            <button id="addChatroomButton" type="submit" class="addChatroomButton">Add Chatroom</button>
            <span id="addChatroomInputMessage"></span>
            `
            content.append(addChatroomForm)
            document.getElementById('addChatroomForm').addEventListener('submit', (e) => {
                e.preventDefault();
                const chatroomInput = document.getElementById('addChatroomInput')
                const inputMessage = document.getElementById('addChatroomInputMessage')
                addChatroom(chatroomInput.value.trim()).then(data => {
                    if (data) {
                        if (data.success) {
                            chatroomInput.value = '';
                            inputMessage.innerText = 'Chat room added successfully!';
                            getChatrooms(searchBar.value, 0)
                                .then(data => {
                                        if (data.success) {
                                            renderChatrooms(displayedChatrooms, data.chatrooms);
                                        } else {
                                            displayedChatrooms.innerHTML = '<p>No chatrooms found.</p>';
                                        }
                                    }
                                )
                        } else {
                            inputMessage.innerText = 'error: ' + data.message;
                        }
                    }
                })
            })
        }
    }
}