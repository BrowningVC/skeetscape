import { SERVER_URL } from '../utils/Constants.js';

class SocketManager {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.pendingEvents = {}; // Store events that arrived before listeners were set up
  }

  connect(token) {
    return new Promise((resolve, reject) => {
      // Load socket.io client from CDN
      const script = document.createElement('script');
      script.src = 'https://cdn.socket.io/4.6.1/socket.io.min.js';
      script.onload = () => {
        this.socket = io(SERVER_URL, {
          auth: { token }
        });

        // Capture init event immediately to prevent it from being lost
        this.socket.on('init', (data) => {
          console.log('📦 Init event received, storing until GameScene is ready...');
          this.pendingEvents.init = data;
        });

        this.socket.on('connect', () => {
          console.log('✅ Connected to server');
          resolve();
        });

        this.socket.on('connect_error', (error) => {
          console.error('❌ Connection error:', error);
          reject(error);
        });

        this.socket.on('disconnect', () => {
          console.log('👋 Disconnected from server');
        });
      };
      document.head.appendChild(script);
    });
  }

  on(event, callback) {
    if (this.socket) {
      // If this is the init event and we already received it, call the callback immediately
      if (event === 'init' && this.pendingEvents.init) {
        console.log('📦 Delivering pending init event to GameScene');
        callback(this.pendingEvents.init);
        delete this.pendingEvents.init;
        // Don't register another listener for init - we already have one in connect()
        return;
      }

      this.socket.on(event, callback);
      this.listeners.set(event, callback);
    }
  }

  off(event) {
    if (this.socket && this.listeners.has(event)) {
      this.socket.off(event, this.listeners.get(event));
      this.listeners.delete(event);
    }
  }

  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

// Singleton instance
const socketManager = new SocketManager();
export default socketManager;
