export let csrfToken = null;

export function setCSRFToken(token) {
    csrfToken = token;
}

function getJsonHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (csrfToken) {
        headers['X-CSRF-Token'] = csrfToken;
    }
    return headers;
}

export async function registerUser(username, password) {
    const resp = await fetch('/api/register', {
        method: 'POST',
        headers: getJsonHeaders(),
        body: JSON.stringify({ username, password }),
        credentials: 'include'
    });
    return resp.json();
}

export async function loginUser(username, password) {
    const resp = await fetch('/api/login', {
        method: 'POST',
        headers: getJsonHeaders(),
        body: JSON.stringify({ username, password }),
        credentials: 'include'
    });
    const data = await resp.json();
    if (data.success && data.csrfToken) {
        setCSRFToken(data.csrfToken);
    }
    return data;
}

export async function logoutUser() {
    const headers = {};
    if (csrfToken) headers['X-CSRF-Token'] = csrfToken;

    const resp = await fetch('/api/logout', {
        method: 'POST',
        headers,
        credentials: 'include'
    });
    return resp.json();
}

export async function getCurrentUser() {
    const resp = await fetch('/api/currentUser', { credentials: 'include' });
    const data = await resp.json();
    if (data.csrfToken) {
        setCSRFToken(data.csrfToken);
    }
    return data;
}
