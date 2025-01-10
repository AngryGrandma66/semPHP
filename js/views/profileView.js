
import { getUserByName } from "../api/userApi.js";
import {sanitize} from "../misc/utils.js";

export async function renderView() {
    const pageURL = window.location.href;
    const userFromUrl = decodeURIComponent(pageURL.substring(pageURL.lastIndexOf('/') + 1));

    const title = document.querySelector('title');
    const content = document.getElementById('content');

    const userResponse = await getUserByName(userFromUrl);

    if (!userResponse.success) {
        title.innerText = 'User Not Found';
        content.innerHTML = '';
        const errorMessage = document.createElement('p');
        errorMessage.textContent = 'This user does not exist.';
        errorMessage.classList.add('error-message');
        content.appendChild(errorMessage);
        return;
    }
const userData = userResponse.user
    title.innerText = userFromUrl;

    content.innerHTML = '';

    const profileBox = document.createElement('div');
    profileBox.id = 'profileBox';
    profileBox.classList.add('profileBox');

    const profilePic = document.createElement('img');
    profilePic.src = userData.pathtopfp;
    profilePic.alt = `${sanitize(userData.username)}'s Profile Picture`;
    profilePic.classList.add('profile-pic');


    profileBox.appendChild(profilePic);

    const usernameElement = document.createElement('h2');
    usernameElement.id = 'username';
    usernameElement.textContent = sanitize(userData.username);
    profileBox.appendChild(usernameElement);

    const emailElement = document.createElement('p');
    emailElement.id = 'email';
    emailElement.innerText= `Email: ${sanitize(userResponse.user.email)}`;
    profileBox.appendChild(emailElement);

    const roleElement = document.createElement('p');
    roleElement.id = 'role';
    roleElement.innerHTML = `Role: ${sanitize(userResponse.user.role)}`;
    profileBox.appendChild(roleElement);

    content.appendChild(profileBox);
}

