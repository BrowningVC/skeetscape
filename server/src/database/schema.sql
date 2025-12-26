-- Users table (authentication)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Players table (game state)
CREATE TABLE IF NOT EXISTS players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  x REAL DEFAULT 400,
  y REAL DEFAULT 300,
  health INTEGER DEFAULT 100,
  max_health INTEGER DEFAULT 100,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Skills table (one row per player per skill)
CREATE TABLE IF NOT EXISTS skills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id INTEGER NOT NULL,
  skill_name TEXT NOT NULL,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  UNIQUE(player_id, skill_name),
  FOREIGN KEY (player_id) REFERENCES players(id)
);

-- Inventory table (items owned by players)
CREATE TABLE IF NOT EXISTS inventory (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id INTEGER NOT NULL,
  item_id TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  slot INTEGER,
  FOREIGN KEY (player_id) REFERENCES players(id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_skills_player ON skills(player_id);
CREATE INDEX IF NOT EXISTS idx_inventory_player ON inventory(player_id);
