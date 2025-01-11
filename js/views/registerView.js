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
       required
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
          required
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
        required
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
        required
        />
        <span id="confirmPasswordError" class="error"></span>
      </div>

      <div class="form-group">
        <label for="profile_pic">Profile picture</label>
        <input type="file"
        name="pfpPic" 
        accept=".webp, .png, .jpeg, .jpg" 
        id="profile_pic"
        alt="profile pic upload"
        required
        />
        
        <span id="fileError" class="error"></span>
       </div>
      <button type="submit">Register</button>
    </form>
  `;
    const title = document.querySelector('title');
    title.innerText = 'Register';
    const form = document.getElementById('registerForm');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();


        const formData = new FormData(form);
        const result = await registerUser(
        formData) ;

        document.getElementById('usernameError').textContent = '';
        document.getElementById('emailError').textContent = '';
        document.getElementById('passwordError').textContent = '';
        document.getElementById('confirmPasswordError').textContent = '';
        document.getElementById('fileError').textContent = '';
        if (result.success) {

            navigateTo('/login');
        } else {
            if (result.errors) {
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
                if (result.errors.pfpPic) {
                    document.getElementById('fileError').textContent = result.errors.pfpPic;
                }
            } else if (result.error) {
                alert(`Error: ${result.error}`);
            }
        }
    });
}
