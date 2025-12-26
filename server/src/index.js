require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const authRoutes = require('./routes/auth');
const GameState = require('./game/GameState');
const GameLoop = require('./game/GameLoop');
const socketHandlers = require('./socket/handlers');
const { initDatabase, saveDatabase } = require('./database/db');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../../client')));

// Routes
app.use('/auth', authRoutes);

// Serve landing page at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/landing.html'));
});

// Serve game at /game
app.get('/game', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/game.html'));
});

let gameState;
let gameLoop;

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', players: gameState ? gameState.players.size : 0 });
});

// Start server
async function startServer() {
  // Initialize database first
  await initDatabase();

  // Initialize game state
  gameState = new GameState();

  // Initialize game loop
  gameLoop = new GameLoop(io, gameState);
  gameLoop.start();

  // Socket.io connection handling
  io.on('connection', (socket) => {
    socketHandlers.handleConnection(socket, io, gameState);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    gameLoop.stop();

    // Save all players
    gameState.getAllPlayers().forEach(player => {
      const queries = require('./database/queries');
      queries.savePlayer(player);
    });

    // Final database save
    saveDatabase();

    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });

  const PORT = process.env.PORT || 3000;
  const HOST = process.env.HOST || '0.0.0.0';

  server.listen(PORT, HOST, () => {
    console.log(`
🎮 Pixel MMO Server Running
━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 Port: ${PORT}
🔗 Host: ${HOST}
📊 Status: http://localhost:${PORT}/health
🎯 Game: http://localhost:${PORT}
━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
