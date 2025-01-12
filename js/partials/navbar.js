import {getCurrentUser, logoutUser} from "../api/userApi.js";
import {navigateTo} from "../router.js";

let lastUserState = {
    loggedIn: null,
    username: null,
    role: null
};

export async function setupNavbar() {
    const navbar = document.getElementById('navbar');

    try {
        const response = await getCurrentUser();

        const newUserState = {
            loggedIn: response.success,
            username: response.user || null,
            role: response.role || null
        };

        const stateChanged =
            lastUserState.loggedIn !== newUserState.loggedIn ||
            lastUserState.username !== newUserState.username ||
            lastUserState.role !== newUserState.role;

        if (!stateChanged) {
            return;
        }

        navbar.innerHTML = '';

        lastUserState = newUserState;


        const homeLink = document.createElement('a');
        homeLink.href = '/home';
        homeLink.textContent = 'Home';
        homeLink.classList.add('navbar-link');
        navbar.appendChild(homeLink);

        if (newUserState.loggedIn) {

            const profileLink = document.createElement('a');
            profileLink.href = '/profile/' + encodeURIComponent(newUserState.username);
            profileLink.textContent = newUserState.username;
            profileLink.classList.add('navbar-link');
            navbar.appendChild(profileLink);

            if (newUserState.role === "admin" || newUserState.role === "owner") {

                const usersLink = document.createElement('a');
                usersLink.href = '/users';
                usersLink.textContent = 'Users';
                usersLink.classList.add('navbar-link');
                navbar.appendChild(usersLink);
            }
            const logoutButton = document.createElement('a');
            logoutButton.id = 'logoutButton'
            logoutButton.textContent = 'Logout';
            logoutButton.classList.add('navbar-link');
            navbar.appendChild(logoutButton);

        } else {

            const loginLink = document.createElement('a');
            loginLink.href = '/login';
            loginLink.textContent = 'Login';
            loginLink.classList.add('navbar-link');
            navbar.appendChild(loginLink);

            const registerLink = document.createElement('a');
            registerLink.href = '/register';
            registerLink.textContent = 'Register';
            registerLink.classList.add('navbar-link');
            navbar.appendChild(registerLink);
        }
    } catch (error) {
        const registerLink = document.createElement('a');
        registerLink.href = '/register';
        registerLink.textContent = 'Register';
        registerLink.classList.add('navbar-link');
        navbar.appendChild(registerLink);
    }

    const docsLink= document.createElement('a');
    docsLink.href = '/docs/';
    docsLink.textContent = 'Docs';
    docsLink.classList.add('navbar-link');
    navbar.appendChild(docsLink);
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
            try {
                const result = await logoutUser();
                if (result.success) {

                    await setupNavbar();

                    navigateTo('/home');
                } else {
                    window.alert(`Logout failed: ${result.error || 'Unknown error'}`);
                }
            } catch (error) {
                window.alert('An unexpected error occurred during logout.');
            }
        });
    }
}

