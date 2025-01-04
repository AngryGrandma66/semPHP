import {loginUser} from '../api/userApi.js';
import {navigateTo} from '../router.js';

export function renderView() {
    const content = document.getElementById('content');
    content.innerHTML = `
    <form id="loginForm">
      <h2>Login</h2>

      <!-- Single field for either username or email -->
      <div class="form-group">
        <label for="loginInput">Username or Email:</label>
        <input
          type="text"
          id="loginInput"
          name="loginInput"
          placeholder="Enter your username or email"
          required
        />
      </div>

      <!-- Password -->
      <div class="form-group">
        <label for="password">Password:</label>
        <input
          type="password"
          id="password"
          name="password"
          placeholder="Enter your password"
          required
        />
      </div>
<span id="loginError" class="error"></span>
      <button type="submit">Login</button>
    </form>   
   `;

 const form = document.getElementById('loginForm');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const loginInput = document.getElementById('loginInput');
        const passwordInput = document.getElementById('password');

        const result = await loginUser(loginInput.value, passwordInput.value);
        if (result.success) {
            navigateTo('/');
        }
        if (result.error) {
            document.getElementById('loginError').textContent = result.error;
        }
    }
    )

}