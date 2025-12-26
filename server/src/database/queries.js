const { run, get, all } = require('./db');

const queries = {
  // Create new user with player and initial skills
  createUser(username, passwordHash) {
    // Insert user
    const userResult = run('INSERT INTO users (username, password_hash) VALUES (?, ?)', [username, passwordHash]);
    const userId = userResult.lastInsertRowid;

    // Insert player
    const playerResult = run('INSERT INTO players (user_id) VALUES (?)', [userId]);
    const playerId = playerResult.lastInsertRowid;

    // Initialize three skills
    run('INSERT INTO skills (player_id, skill_name, level, xp) VALUES (?, ?, 1, 0)', [playerId, 'combat']);
    run('INSERT INTO skills (player_id, skill_name, level, xp) VALUES (?, ?, 1, 0)', [playerId, 'fishing']);
    run('INSERT INTO skills (player_id, skill_name, level, xp) VALUES (?, ?, 1, 0)', [playerId, 'woodcutting']);

    return { userId, playerId };
  },

  // Get user by username (for login)
  getUserByUsername(username) {
    return get('SELECT * FROM users WHERE username = ?', [username]);
  },

  // Load full player state
  loadPlayer(userId) {
    const player = get('SELECT * FROM players WHERE user_id = ?', [userId]);

    if (!player) {
      return null;
    }

    const skills = all('SELECT skill_name, level, xp FROM skills WHERE player_id = ?', [player.id]);
    const inventory = all('SELECT item_id, quantity, slot FROM inventory WHERE player_id = ? ORDER BY slot', [player.id]);

    const skillsMap = {};
    skills.forEach(skill => {
      skillsMap[skill.skill_name] = {
        level: skill.level,
        xp: skill.xp
      };
    });

    return {
      id: player.id,
      userId: player.user_id,
      x: player.x,
      y: player.y,
      health: player.health,
      maxHealth: player.max_health,
      skills: skillsMap,
      inventory: inventory
    };
  },

  // Save player state
  savePlayer(playerData) {
    // Update player position and health
    run('UPDATE players SET x = ?, y = ?, health = ? WHERE id = ?',
      [playerData.x, playerData.y, playerData.health, playerData.id]);

    // Update skills
    for (const [skillName, skillData] of Object.entries(playerData.skills)) {
      run('UPDATE skills SET level = ?, xp = ? WHERE player_id = ? AND skill_name = ?',
        [skillData.level, skillData.xp, playerData.id, skillName]);
    }

    // Update inventory (delete and reinsert for simplicity)
    run('DELETE FROM inventory WHERE player_id = ?', [playerData.id]);

    if (playerData.inventory && playerData.inventory.length > 0) {
      for (const item of playerData.inventory) {
        run('INSERT INTO inventory (player_id, item_id, quantity, slot) VALUES (?, ?, ?, ?)',
          [playerData.id, item.item_id, item.quantity, item.slot]);
      }
    }
  }
};

module.exports = queries;
