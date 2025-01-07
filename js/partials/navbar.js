import {getCurrentUser, logoutUser} from "../api/userApi.js";
import {navigateTo} from "../router.js"; // Adjust the path as needed
import {sanitize} from "../misc/utils.js";
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
        <button id="logoutButton" style="background: none; color: #fff; border: none; cursor: pointer; font-weight: bold;">Logout</button>            `;

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
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
            try {
                const result = await logoutUser();
                if (result.success) {
                    // Re-render the navbar to reflect logged-out state
                    await setupNavbar();
                    // Optionally navigate to home or login
                    navigateTo('/home'); // Ensure navigateTo is imported
                } else {
                    window.alert(`Logout failed: ${result.error || 'Unknown error'}`);
                }
            } catch (error) {
                window.alert('An unexpected error occurred during logout.');
            }
        });
    }
}

/**
 * Utility function to sanitize user input to prevent XSS attacks.
 * @param {string} str - The string to sanitize.
 * @returns {string} - The sanitized string.
 */
