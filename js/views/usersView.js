import { getCurrentUser } from "../api/userApi.js";
import { navigateTo } from "../router.js";
import { getAllUsers, updateUserRole } from "../api/adminApi.js";
import { sanitize } from "../misc/utils.js";
import { renderFancyPagination } from "../misc/renderAdds.js";

export async function renderView() {
    const content = document.getElementById('content');
    const title = document.querySelector('title');
    title.innerText = 'Users';

    content.innerHTML = `
      <h2>All Users</h2>
      <div id="userList"></div>
      <div id="paginationBar" class="pagination-bar"></div>
      <p id="usersStatusMessage"></p>
    `;

    const userList = document.getElementById('userList');
    const paginationBar = document.getElementById('paginationBar');
    const statusMessage = document.getElementById('usersStatusMessage');

    const currentUserData = await getCurrentUser();
    if (!currentUserData.success) {
        navigateTo('/login');
        return;
    }
    const currentRole = currentUserData.role;
    if (currentRole !== 'admin' && currentRole !== 'owner') {
        statusMessage.textContent = 'You do not have permission to view this page.';
        return;
    }

    let currentPage = 1;
    let totalPages = 1;
    const usersPerPage = 8;

    async function loadPage(page) {
        userList.innerHTML = '';
        statusMessage.textContent = '';

        const resp = await getAllUsers(page);
        if (!resp.success) {
            statusMessage.textContent = resp.error || 'Error fetching users';
            return;
        }

        totalPages = Math.ceil(resp.total / usersPerPage);

        resp.users.forEach(user => {
            const userDiv = document.createElement('div');
            userDiv.classList.add('user-item');
            userDiv.innerHTML = `
        <img alt="${sanitize(user.username)} profile picture" src="${sanitize(user.pathtopfp)}"/>
        <p>Username: ${sanitize(user.username)}</p>
        <p>Email: ${sanitize(user.email)}</p>
        <span>Role: <span class="user-role">${sanitize(user.role)}</span></span>
      `;

            if (user.role === 'user') {
                const promoteBtn = document.createElement('button');
                promoteBtn.textContent = 'Promote to Admin';
                promoteBtn.addEventListener('click', async () => {
                    const updateResponse = await updateUserRole(user.username, 'admin');
                    if (updateResponse.success) {
                        userDiv.querySelector('.user-role').textContent = ' admin';
                        promoteBtn.remove();
                    } else {
                        alert(updateResponse.error || 'Could not promote user');
                    }
                });
                userDiv.appendChild(promoteBtn);
            } else if (user.role === 'admin' && currentRole === 'owner') {
                const demoteBtn = document.createElement('button');
                demoteBtn.textContent = 'Demote to User';
                demoteBtn.addEventListener('click', async () => {
                    const updateResponse = await updateUserRole(user.username, 'user');
                    if (updateResponse.success) {
                        userDiv.querySelector('.user-role').textContent = ' user';
                        demoteBtn.remove();
                    } else {
                        alert(updateResponse.error || 'Could not demote user');
                    }
                });
                userDiv.appendChild(demoteBtn);
            }

            userList.appendChild(userDiv);
        });

        renderFancyPagination(paginationBar, page, totalPages, (pageNum) => {
            currentPage = pageNum;
            loadPage(currentPage);
        });
    }

    await loadPage(currentPage);
}
