import {getJsonHeaders} from "../misc/utils.js";

export async function getAllUsers(page = 1) {
    const offset = (page - 1) * 8;
    const resp = await fetch(`/api/getAllUsers?offset=${offset}`, {
        method: 'GET',
        credentials: 'include'
    });
    return resp.json();
    // Ex: { success: true, users: [...], total: 123 }
}
export async function updateUserRole(username, role) {
    const resp = await fetch('/api/updateUserRole', {
        method: 'POST',
        headers: getJsonHeaders(),
        credentials: 'include',
        body: JSON.stringify({username, role})
    });
    return resp.json();
}
