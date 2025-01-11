import {getCurrentUser} from '../api/userApi.js';
import {sanitize} from "../misc/utils.js";
import {addChatroom, getChatrooms} from "../api/chatApi.js";
import {renderChatrooms, renderFancyPagination} from "../misc/renderAdds.js";

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
        displayedChatrooms.innerHTML = '';

        const resp = await getChatrooms(filter, page);
        if (!resp.success) {
            displayedChatrooms.innerHTML = `<p>${resp.error || 'No chatrooms found.'}</p>`;
            paginationBar.innerHTML = '';
            return;
        }

        renderChatrooms(displayedChatrooms, resp.chatrooms);

        totalPages = Math.ceil(resp.total / 10);

        renderFancyPagination(
            paginationBar,
            page,
            totalPages,
            (pageNum) => {
                currentPage = pageNum;
                loadChatrooms(currentPage, currentFilter);
            }
        );
    }

    await loadChatrooms(currentPage, currentFilter);

    searchBar.addEventListener('keyup', () => {
        currentFilter = searchBar.value;
        currentPage = 1;
        loadChatrooms(currentPage, currentFilter);
    });    if (userData.success) {
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
                            getChatrooms(searchBar.value, 1)
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