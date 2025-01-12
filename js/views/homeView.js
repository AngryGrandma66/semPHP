import {getCurrentUser} from '../api/userApi.js';
import {sanitize} from "../misc/utils.js";
import {addChatroom, getChatrooms} from "../api/chatApi.js";
import {renderChatrooms, renderFancyPagination} from "../misc/renderAdds.js";

export async function renderView() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <div id="homeView">
            <span id="homeLoggedInUser"></span>
            
            <input 
                type="text" 
                id="homeChatroomSearch" 
                name="homeChatroomSearch" 
                class="chatroomSearch" 
                placeholder="searchbar"
            />
            
            <div id="homeChatroomList" class="HomeChatroomList"></div>
            
            <div id="chatroomPaginationBar" class="pagination-bar"></div>
        </div>
    `;

    const title = document.querySelector('title');
    title.innerText = 'Home';

    const displayedChatrooms = document.getElementById('homeChatroomList');
    const userData = await getCurrentUser();
    const searchBar = document.getElementById('homeChatroomSearch');
    const paginationBar = document.getElementById('chatroomPaginationBar');
    const homeLoggedInUserSpan = document.getElementById('homeLoggedInUser');

    if (userData.success) {
        homeLoggedInUserSpan.textContent = `You are logged in as ${sanitize(userData.user)}`;
    } else {
        homeLoggedInUserSpan.textContent = "You are not logged in";
    }

    let currentFilter = '';
    let currentPage = 1;
    let totalPages = 1;
    const pageSize = 10;

    async function loadChatrooms(page, filter) {
        displayedChatrooms.innerHTML = '';

        const resp = await getChatrooms(filter, page);
        if (!resp.success) {
            displayedChatrooms.innerHTML = `<p>${resp.error || 'No chatrooms found.'}</p>`;
            paginationBar.innerHTML = '';
            return;
        }

        renderChatrooms(displayedChatrooms, resp.chatrooms);

        totalPages = Math.ceil(resp.total / pageSize);

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
        currentFilter = searchBar.value.trim();
        currentPage = 1;
        loadChatrooms(currentPage, currentFilter);
    });

    if (userData.success && (userData.role === 'admin' || userData.role === 'owner')) {
        const addChatroomForm = document.createElement('form');
        addChatroomForm.id = 'addChatroomForm';
        addChatroomForm.classList.add('addChatroom');
        addChatroomForm.innerHTML = `
<label for="addChatroomInput">Add chatroom</label>
            <input 
                type="text" 
                name="addChatroomInput" 
                id="addChatroomInput"
                placeholder="Name of new chatroom"
                minlength="3"
                maxlength="20"
            />
            <button 
                id="addChatroomButton" 
                type="submit" 
                class="addChatroomButton"
            >
                Add Chatroom
            </button>
            <span id="addChatroomInputMessage"></span>
        `;
        content.append(addChatroomForm);

        addChatroomForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const chatroomInput = document.getElementById('addChatroomInput');
            const inputMessage = document.getElementById('addChatroomInputMessage');
            const chatroomValue = chatroomInput.value.trim();

            if (!chatroomValue) {
                inputMessage.innerText = 'Please enter a valid chatroom name';
                return;
            }

            const data = await addChatroom(chatroomValue);
            if (!data) return;

            if (data.success) {
                chatroomInput.value = '';
                inputMessage.innerText = 'Chat room added successfully!';

                currentPage = 1;
                await loadChatrooms(currentPage, currentFilter);
            } else {
                inputMessage.innerText = `error: ${data.message}`;
            }
        });
    }
}
