import {registerUser} from '../api/userApi.js';
import {navigateTo} from '../router.js';

export function renderView() {
    const content = document.getElementById('content');
    content.innerHTML = `
    <form id="registerForm">
      <div class="form-group">
        <label for="username">Username: *</label>
        <input
          type="text"
          id="username"
          name="username"
          placeholder="Choose a username"
          pattern="^[A-Za-z0-9_]{3,20}$"
          minlength="3"
          maxlength="20"
       required
        />
        <span class="inputHelper">Letters, numbers, underscores only</span>
        <span id="usernameError" class="error"></span>
      </div>

      <div class="form-group">
        <label for="email">Email: *</label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="Enter your email"
          required
        />
        <span class="inputHelper">Must be a valid email address.</span>
        <span id="emailError" class="error"></span>
      </div>

      <div class="form-group">
        <label for="password">Password: *</label>
        <input
          type="password"
          id="password"
          name="password"
          placeholder="Create a password"
          minlength="8"
          maxlength="100"
        required
        />
        <span class="inputHelper">Mixed-case, digit, and symbol mandatory.</span>
        <span id="passwordError" class="error"></span>
      </div>

      <div class="form-group">
        <label for="confirmPassword">Confirm Password: *</label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          placeholder="Re-enter your password"
          minlength="8"
          maxlength="100"
        required
        />
        <span class="inputHelper">Must match original password.</span>
        <span id="confirmPasswordError" class="error"></span>
      </div>

      <div class="form-group">
        <label for="profile_pic">Profile picture: *</label>
        <input type="file"
        name="pfpPic" 
        accept=".webp, .png, .jpeg, .jpg" 
        id="profile_pic"
        required
        />
        <span class="fileNameDisplay" id="fileNameDisplay"></span>  
        <span id="fileError" class="error"></span>
       </div>
      <button type="submit">Register</button>
    </form>
  `;
    const title = document.querySelector('title');
    title.innerText = 'Register';
    const form = document.getElementById('registerForm');

    const fileInput = document.getElementById('profile_pic');
    const fileNameDisplay = document.getElementById('fileNameDisplay');

    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            fileNameDisplay.textContent = fileInput.files[0].name;
        } else {
            fileNameDisplay.textContent = '';
        }
    });
    form.addEventListener('submit', async (e) => {
        e.preventDefault();


        document.getElementById('usernameError').textContent = '';
        document.getElementById('emailError').textContent = '';
        document.getElementById('passwordError').textContent = '';
        document.getElementById('confirmPasswordError').textContent = '';
        document.getElementById('fileError').textContent = '';
        if (document.getElementById('password').value !== document.getElementById('confirmPassword').value) {

            document.getElementById('confirmPasswordError').textContent ='Passwords do not match'
            return;
        }


        const formData = new FormData(form);

        const result = await registerUser(formData);
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
