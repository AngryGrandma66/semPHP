import {getJsonHeaders} from "../misc/utils.js";

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
    return await resp.json();
}


export async function logoutUser() {

    const resp = await fetch('/api/logout', {
        method: 'POST',
        headers: getJsonHeaders(),
        credentials: 'include'
    });
    const data = await resp.json();

    if (data.success) {
        import('../partials/navbar.js').then(module => module.setupNavbar());
    }

    return data;
}
export async function getCurrentUser() {
    const resp = await fetch('/api/currentUser', {
        method: 'GET',
        credentials: 'include'
    });

    return await resp.json();
}


export async function getUserByName(name) {
   const resp = await fetch(`/api/userByName?username=${encodeURIComponent(name)}`, {
       method: 'GET',
       credentials: 'include'
   });
   return await resp.json();

}






