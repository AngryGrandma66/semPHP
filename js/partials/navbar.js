

import { getCurrentUser } from "../api/userApi.js"; // Adjust the path as needed

// Function to create a link element
function createLink(href, text) {
    const link = document.createElement('a');
    link.href = href;
    link.textContent = text;
    link.style.marginRight = '15px'; // Optional styling
    return link;
}

// Function to setup the navbar
export async function setupNavbar() {
    const navbar = document.getElementById('navbar');

    // Clear any existing content
    navbar.innerHTML = '';

    try {
        const response = await getCurrentUser();

        // Always show the Home link
        navbar.appendChild(createLink('/home', 'Home'));

        if (response.success) {
            const { username, role } = response;

            // Show Profile link
            navbar.appendChild(createLink('/profile', 'Profile'));

            // Show Logout link
            navbar.appendChild(createLink('/logout.php', 'Logout')); // Adjust the path as needed

            // If the user is an admin or owner, show the Users link
            if (role === 'admin' || role === 'owner') {
                navbar.appendChild(createLink('/users', 'Users'));
            }

            // Optional: Display username
            const userSpan = document.createElement('span');
            userSpan.textContent = `Welcome, ${username}`;
            userSpan.style.marginLeft = '15px'; // Optional styling
            navbar.appendChild(userSpan);
        } else {
            // User is not logged in; show Login and Register links
            navbar.appendChild(createLink('/login', 'Login'));
            navbar.appendChild(createLink('/register', 'Register'));
        }
    } catch (error) {
        console.error('Error fetching current user:', error);
        // In case of error, default to showing Login and Register
        navbar.appendChild(createLink('/login', 'Login'));
        navbar.appendChild(createLink('/register', 'Register'));
    }
}
