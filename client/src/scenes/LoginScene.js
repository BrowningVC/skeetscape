import { SERVER_URL } from '../utils/Constants.js';
import socketManager from '../network/SocketManager.js';

export default class LoginScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LoginScene' });
  }

  create() {
    // Show auth container
    document.getElementById('auth-container').style.display = 'block';

    // Set up form switching
    document.getElementById('show-register').addEventListener('click', () => {
      document.getElementById('login-form').classList.remove('active');
      document.getElementById('register-form').classList.add('active');
    });

    document.getElementById('show-login').addEventListener('click', () => {
      document.getElementById('register-form').classList.remove('active');
      document.getElementById('login-form').classList.add('active');
    });

    // Login handler
    document.getElementById('login-btn').addEventListener('click', () => {
      this.handleLogin();
    });

    // Register handler
    document.getElementById('register-btn').addEventListener('click', () => {
      this.handleRegister();
    });

    // Enter key handlers
    document.getElementById('login-password').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleLogin();
    });

    document.getElementById('register-password').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleRegister();
    });
  }

  async handleLogin() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');

    errorEl.textContent = '';

    if (!username || !password) {
      errorEl.textContent = 'Please fill in all fields';
      return;
    }

    try {
      const response = await fetch(`${SERVER_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        errorEl.textContent = data.error || 'Login failed';
        return;
      }

      // Store token
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);

      // Connect to game server
      await this.connectToGame(data.token);
    } catch (error) {
      console.error('Login error:', error);
      errorEl.textContent = 'Connection error. Please try again.';
    }
  }

  async handleRegister() {
    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value;
    const errorEl = document.getElementById('register-error');

    errorEl.textContent = '';

    if (!username || !password) {
      errorEl.textContent = 'Please fill in all fields';
      return;
    }

    if (username.length < 3 || username.length > 20) {
      errorEl.textContent = 'Username must be 3-20 characters';
      return;
    }

    if (password.length < 6) {
      errorEl.textContent = 'Password must be at least 6 characters';
      return;
    }

    try {
      const response = await fetch(`${SERVER_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        errorEl.textContent = data.error || 'Registration failed';
        return;
      }

      // Store token
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);

      // Connect to game server
      await this.connectToGame(data.token);
    } catch (error) {
      console.error('Register error:', error);
      errorEl.textContent = 'Connection error. Please try again.';
    }
  }

  async connectToGame(token) {
    try {
      await socketManager.connect(token);

      // Hide auth container
      document.getElementById('auth-container').style.display = 'none';

      // Show game container
      document.getElementById('game-container').style.display = 'flex';

      // Start game scene
      this.scene.start('GameScene');
      this.scene.start('UIScene');
    } catch (error) {
      console.error('Connection error:', error);
      document.getElementById('login-error').textContent = 'Failed to connect to game server';
    }
  }
}
