import {getCurrentUser} from "../api/userApi.js"; // Adjust the path as needed

// Variable to store the last known user state
let lastUserState = {
    loggedIn: null,
    username: null,
    role: null
};

// Function to setup the navbar
export async function setupNavbar() {
    const navbar = document.getElementById('navbar');

    try {
        const response = await getCurrentUser();

        // Determine the new user state
        const newUserState = {
            loggedIn: response.success,
            username: response.user || null,
            role: response.role || null
        };

        // Check if the user state has changed
        const stateChanged =
            lastUserState.loggedIn !== newUserState.loggedIn ||
            lastUserState.username !== newUserState.username ||
            lastUserState.role !== newUserState.role;

        if (!stateChanged) {
            // No change in user state; no need to update the navbar
            return;
        }

        // Update the last known user state
        lastUserState = newUserState;

        // Start building the HTML content
        let htmlContent = `
            <a href="/home"  ">Home</a>
        `;

        if (newUserState.loggedIn) {
            const {username, role} = newUserState;

            htmlContent += `
                <a href="/profile"  ">Profile</a>
                <a href="/logout"  ">Logout</a>
            `;

            // If the user is an admin or owner, add the Users link
            if (role === 'admin' || role === 'owner') {
                htmlContent += `<a href="/users"  ">Users</a>`;
            }

            // Display the username
            htmlContent += `<span ">Welcome, ${sanitize(username)}</span>`;
        } else {
            // User is not logged in; show Login and Register links
            htmlContent += `
                <a href="/login"  ">Login</a>
                <a href="/register"  ">Register</a>
            `;
        }

        // Inject the constructed HTML into the navbar
        navbar.innerHTML = htmlContent;
    } catch (error) {
        console.error('Error fetching current user:', error);
        // In case of error, default to showing Login and Register
        navbar.innerHTML = `
<!--            <a href="/login"  ">Login</a>-->
            <a href="/register"  ">Register</a>
        `;
    }
}

/**
 * Utility function to sanitize user input to prevent XSS attacks.
 * @param {string} str - The string to sanitize.
 * @returns {string} - The sanitized string.
 */
function sanitize(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}
