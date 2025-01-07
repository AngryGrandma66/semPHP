import {getJsonHeaders, setCSRFToken} from "../misc/utils.js";

export async function registerUser(formData) {
    const resp = await fetch('/api/register', {
        method: 'POST',
        body: formData,
        credentials: 'include'
    });
    return resp.json();
}

export async function loginUser(loginInput, password) {
    const resp = await fetch('/api/login', {
        method: 'POST',
        headers: getJsonHeaders(),
        body: JSON.stringify({ loginInput, password }),
        credentials: 'include'
    });
    const data = await resp.json();
    // if (data.success && data.csrfToken) {
    //     setCSRFToken(data.csrfToken);
    // }
    return data;
}


export async function logoutUser() {

    const resp = await fetch('/api/logout', {
        method: 'POST',
        headers: getJsonHeaders(),
        credentials: 'include'
    });
    const data = await resp.json();

    if (data.success) {
        // Update the navbar after successful logout
        import('../partials/navbar.js').then(module => module.setupNavbar());
    }

    return data;
}
export async function getCurrentUser() {
    const resp = await fetch('/api/currentUser', { credentials: 'include' });
    const data = await resp.json();
    if (data.csrfToken) {
        setCSRFToken(data.csrfToken);
    }
    return data;
}
