import { getCurrentUser } from '../api/userApi.js';

export async function renderView() {
    const content = document.getElementById('content');
    content.textContent = 'Loading...';

    const userData = await getCurrentUser();
    content.textContent = '';

    if (!userData.loggedIn) {
        const p = document.createElement('p');
        p.textContent = 'Welcome! You are not logged in. Please login or register.';
        content.appendChild(p);
    } else {
        const p = document.createElement('p');
        p.textContent = `Hello, ${userData.user.username}!`;
        content.appendChild(p);
        // Add links or buttons to navigate
    }
}
