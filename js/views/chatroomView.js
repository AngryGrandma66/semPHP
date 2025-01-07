import {getCurrentUser} from "../api/userApi.js";
import {getChatrooms} from "../api/chatApi.js";
import {renderChatrooms} from "../misc/renderAdds.js";

export async function renderView() {
    const content = document.getElementById('content');
    content.innerHTML =`
    <aside>
    <input type="text" id="chatroomSearch" name="chatroomSearch" class="chatroomSearch" placeholder="searchbar">
    <div id="asideChatroomList"></div>
    </aside>` ;

    const chatroomList = document.getElementById('asideChatroomList');

    const userData = await getCurrentUser();

    await getChatrooms('',0)
        .then(data => {
            if (data.success) {
                renderChatrooms(chatroomList, data.chatrooms);
            } else {
                chatroomList.innerHTML = '<p>No chatrooms found.</p>';
            }
        })

    const searchBar = document.getElementById('chatroomSearch')
    searchBar.addEventListener('keyup', () => {
        getChatrooms(searchBar.value,0)
            .then(data => {
                    if (data.success) {
                        renderChatrooms(chatroomList, data.chatrooms);
                    } else {
                        chatroomList.innerHTML = '<p>No chatrooms found.</p>';
                    }
                }
            )
    })




}
