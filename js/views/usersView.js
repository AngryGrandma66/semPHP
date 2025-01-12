
import {getCurrentUser} from "../api/userApi.js";
import {navigateTo} from "../router.js";
import {getAllUsers, updateUserRole} from "../api/adminApi.js";

export async function renderView() {
    const content = document.getElementById('content');
    const title = document.querySelector('title');
    title.innerText = 'Users';

    content.innerHTML = `
      <h2>All Users</h2>
      <div id="userList"></div>

      <div id="paginationBar" class="pagination-bar">
      </div>

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

    async function loadPage(page) {
        userList.innerHTML = '';

        const resp = await getAllUsers(page);
        if (!resp.success) {
            statusMessage.textContent = resp.error || 'Error fetching users';
            return;
        }

        totalPages = Math.ceil(resp.total / 8);

        resp.users.forEach(user => {
            const userDiv = document.createElement('div');
            userDiv.classList.add('user-item');
            userDiv.innerHTML = `
                <p>Username: ${user.username}</p>
                <p>Email: ${user.email}</p>
                <p>Role:</p>
                <span class="user-role">${user.role}</span>
            `;

            if (user.role === 'user') {
                const promoteBtn = document.createElement('button');
                promoteBtn.textContent = 'Promote to Admin';
                promoteBtn.addEventListener('click', async () => {
                    const updateResponse = await updateUserRole(user.username, 'admin');
                    if (updateResponse.success) {
                        userDiv.querySelector('.user-role').textContent = 'admin';
                        promoteBtn.remove();
                    } else {
                        alert(updateResponse.error || 'Could not promote user');
                    }
                });
                userDiv.appendChild(promoteBtn);
            }
            else if (user.role === 'admin' && currentRole === 'owner') {
                const demoteBtn = document.createElement('button');
                demoteBtn.textContent = 'Demote to User';
                demoteBtn.addEventListener('click', async () => {
                    const updateResponse = await updateUserRole(user.username, 'user');
                    if (updateResponse.success) {
                        userDiv.querySelector('.user-role').textContent = 'user';
                        demoteBtn.remove();
                    } else {
                        alert(updateResponse.error || 'Could not demote user');
                    }
                });
                userDiv.appendChild(demoteBtn);
            }

            userList.appendChild(userDiv);
        });

        renderPagination(page, totalPages);
    }

    function renderPagination(page, total) {
        paginationBar.innerHTML = '';

        if (page > 1) {
            const prevBtn = document.createElement('button');
            prevBtn.textContent = 'Prev';
            prevBtn.addEventListener('click', () => {
                currentPage = page - 1;
                loadPage(currentPage);
            });
            paginationBar.appendChild(prevBtn);
        }

        for (let p = 1; p <= total; p++) {
            const pageBtn = document.createElement('button');
            pageBtn.textContent = p.toString();
            if (p === page) {
                pageBtn.disabled = true;
            }
            pageBtn.addEventListener('click', () => {
                currentPage = p;
                loadPage(currentPage);
            });
            paginationBar.appendChild(pageBtn);
        }

        if (page < total) {
            const nextBtn = document.createElement('button');
            nextBtn.textContent = 'Next';
            nextBtn.addEventListener('click', () => {
                currentPage = page + 1;
                loadPage(currentPage);
            });
            paginationBar.appendChild(nextBtn);
        }
    }

    await loadPage(currentPage);
}
