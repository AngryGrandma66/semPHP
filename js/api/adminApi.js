import {getJsonHeaders, basePath} from "../misc/utils.js";

export async function getAllUsers(page = 1) {
    const offset = (page - 1) * 8;
    const resp = await fetch(basePath + `api/getAllUsers?offset=${offset}`, {
        method: 'GET',
        credentials: 'include'
    });
    return resp.json();
}

export async function updateUserRole(username, role) {
    const resp = await fetch(basePath + 'api/updateUserRole', {
        method: 'POST',
        headers: getJsonHeaders(),
        credentials: 'include',
        body: JSON.stringify({username, role})
    });
    return resp.json();
}
