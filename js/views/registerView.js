import { registerUser } from '../api/userApi.js';
import { navigateTo } from '../router.js';

export function renderView() {
    const content = document.getElementById('content');
    content.innerHTML = `
    <form id="registerForm">
      <!-- Username -->
      <div class="form-group">
        <label for="username">Username:</label>
        <input
          type="text"
          id="username"
          name="username"
          placeholder="Choose a username"
        />
        <span id="usernameError" class="error"></span>
      </div>

      <!-- Email -->
      <div class="form-group">
        <label for="email">Email:</label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="Enter your email"
        />
        <span id="emailError" class="error"></span>
      </div>

      <!-- Password -->
      <div class="form-group">
        <label for="password">Password:</label>
        <input
          type="password"
          id="password"
          name="password"
          placeholder="Create a password"
        />
        <span id="passwordError" class="error"></span>
      </div>

      <!-- Confirm Password -->
      <div class="form-group">
        <label for="confirmPassword">Confirm Password:</label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          placeholder="Re-enter your password"
        />
        <span id="confirmPasswordError" class="error"></span>
      </div>

      <button type="submit">Register</button>
    </form>
  `;

    const form = document.getElementById('registerForm');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Grab all the input elements
        const userInput = document.getElementById('username');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirmPassword');

        // Send registration request to the API
        const result = await registerUser(
            userInput.value,
            emailInput.value,
            passwordInput.value,
            confirmPasswordInput.value,
        );

        // Clear out previous error messages
        document.getElementById('usernameError').textContent = '';
        document.getElementById('emailError').textContent = '';
        document.getElementById('passwordError').textContent = '';
        document.getElementById('confirmPasswordError').textContent = '';

        if (result.success) {
            // If registration is successful, navigate to login (or anywhere else)
            navigateTo('/login');
        } else {
            // If registration fails, check for field-specific errors
            if (result.errors) {
                // result.errors is an object containing error messages
                if (result.errors.username) {
                    document.getElementById('usernameError').textContent = result.errors.username;
                }
                if (result.errors.email) {
                    document.getElementById('emailError').textContent = result.errors.email;
                }
                if (result.errors.password) {
                    document.getElementById('passwordError').textContent = result.errors.password;
                }
                if (result.errors.confirmPassword) {
                    document.getElementById('confirmPasswordError').textContent = result.errors.confirmPassword;
                }
            } else if (result.error) {
                // If there’s a generic error message (or some other error structure)
                alert(`Error: ${result.error}`);
            }
        }
    });
}
