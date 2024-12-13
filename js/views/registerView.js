import { registerUser } from '../api/userApi.js';
import { navigateTo } from '../router.js';

export function renderView() {
    const content = document.getElementById('content');
    content.textContent = '';

    const h2 = document.createElement('h2');
    h2.textContent = 'Register';
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
    submitBtn.textContent = 'Register';

    form.appendChild(userInput);
    form.appendChild(passInput);
    form.appendChild(submitBtn);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const result = await registerUser(userInput.value.trim(), passInput.value);
        if (result.success) {
            alert('Registration successful. You can now login.');
            navigateTo('/login');
        } else {
            alert(`Error: ${result.error}`);
        }
    });

    content.appendChild(form);

    const p = document.createElement('p');
    p.textContent = 'Already have an account? ';
    const loginLink = document.createElement('a');
    loginLink.href = '/login';
    loginLink.textContent = 'Login';
    loginLink.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo('/login');
    });
    p.appendChild(loginLink);

    content.appendChild(p);
}
