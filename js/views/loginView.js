import { loginUser } from '../api/userApi.js';
import { navigateTo } from '../router.js';

export function renderView() {
    const content = document.getElementById('content');
    content.textContent = ''; // Clear old content

    const h2 = document.createElement('h2');
    h2.textContent = 'Login';
    content.appendChild(h2);

    const form = document.createElement('form');

    const userInput = document.createElement('input');
    userInput.type = 'text';
    userInput.placeholder = 'Username';
    userInput.required = true;

    const passInput = document.createElement('input');
    passInput.type = 'password';
    passInput.placeholder = 'Password';
    passInput.required = true;

    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.textContent = 'Login';

    form.appendChild(userInput);
    form.appendChild(passInput);
    form.appendChild(submitBtn);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const result = await loginUser(userInput.value.trim(), passInput.value);
        if (result.success) {
            alert('Login successful!');
            navigateTo('/home');
        } else {
            alert(`Error: ${result.error}`);
        }
    });
    content.appendChild(form);

    const p = document.createElement('p');
    p.textContent = 'Don’t have an account? ';
    const regLink = document.createElement('a');
    regLink.href = '/register';
    regLink.textContent = 'Register';
    regLink.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo('/register');
    });
    p.appendChild(regLink);

    content.appendChild(p);
}
