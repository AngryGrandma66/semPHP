import {getCurrentUser} from '../api/userApi.js';
import {sanitize} from "../misc/utils.js";
import {addChatroom, getChatrooms} from "../api/chatApi.js";
import {renderChatrooms} from "../misc/renderAdds.js";

export async function renderView() {
    const content = document.getElementById('content');
    content.innerHTML = `
    <div id="homeView">
    <span id="homeLoggedInUser"></span>
    <input type="text" id="homeChatroomSearch" name="homeChatroomSearch" class="chatroomSearch" placeholder="searchbar">
    <div id="homeChatroomList" class="HomeChatroomList">
    </div>
    </div>
    `

    const title = document.querySelector('title');
    title.innerText = 'home';

    const displayedChatrooms = document.getElementById('homeChatroomList');
    const userData = await getCurrentUser();
    getChatrooms('',0)
        .then(data => {
            if (data.success) {
                renderChatrooms(displayedChatrooms, data.chatrooms);
            } else {
                displayedChatrooms.innerHTML = '<p>No chatrooms found.</p>';
            }
        })
    if (userData.success) {
        document.getElementById('homeLoggedInUser').textContent = `You are logged in as ${sanitize(userData.user)}`
    } else {
        document.getElementById('homeLoggedInUser').textContent = "You are not logged in";
    }

    console.log(userData);
    const searchBar = document.getElementById('homeChatroomSearch')
    searchBar.addEventListener('keyup', () => {
        getChatrooms(searchBar.value,0)
            .then(data => {
                    if (data.success) {
                        renderChatrooms(displayedChatrooms, data.chatrooms);
                    } else {
                        displayedChatrooms.innerHTML = '<p>No chatrooms found.</p>';
                    }
                }
            )
    })
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
                            getChatrooms(searchBar.value,0)
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
