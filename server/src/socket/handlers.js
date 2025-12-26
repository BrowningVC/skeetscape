const auth = require('../utils/auth');
const queries = require('../database/queries');
const CombatSystem = require('../game/CombatSystem');
const SkillSystem = require('../game/SkillSystem');
const ItemSystem = require('../game/ItemSystem');

module.exports = {
  handleConnection(socket, io, gameState) {
    // Authenticate user via JWT token
    const token = socket.handshake.auth.token;

    if (!token) {
      socket.disconnect();
      return;
    }

    const decoded = auth.verifyToken(token);

    if (!decoded) {
      socket.disconnect();
      return;
    }

    // Load player from database
    const playerData = queries.loadPlayer(decoded.userId);

    if (!playerData) {
      socket.disconnect();
      return;
    }

    // Add username to player data
    playerData.username = decoded.username;

    // Add player to game state
    gameState.addPlayer(socket.id, playerData);

    console.log(`✅ Player connected: ${decoded.username} (${socket.id})`);

    // Send initial game state to player
    socket.emit('init', {
      player: playerData,
      otherPlayers: gameState.getOtherPlayers(socket.id),
      monsters: gameState.getAllMonsters(),
      trees: gameState.getAllTrees(),
      fishingSpots: gameState.getAllFishingSpots(),
      fires: gameState.getAllFires(),
      groundItems: gameState.getAllGroundItems()
    });

    // Broadcast to others that player joined
    socket.broadcast.emit('playerJoined', {
      socketId: socket.id,
      username: decoded.username,
      x: playerData.x,
      y: playerData.y,
      health: playerData.health,
      maxHealth: playerData.maxHealth
    });

    // Set up event handlers
    socket.on('move', (data) => this.handleMove(socket, io, gameState, data));
    socket.on('attack', (data) => this.handleAttack(socket, io, gameState, data));
    socket.on('fish', (data) => this.handleFish(socket, io, gameState, data));
    socket.on('chop', (data) => this.handleChop(socket, io, gameState, data));
    socket.on('useItem', (data) => this.handleUseItem(socket, io, gameState, data));
    socket.on('placeFirepit', (data) => this.handlePlaceFirepit(socket, io, gameState, data));
    socket.on('pickupGroundItem', (data) => this.handlePickupGroundItem(socket, io, gameState, data));

    socket.on('disconnect', () => {
      const player = gameState.getPlayer(socket.id);
      if (player) {
        // Save player to database
        queries.savePlayer(player);

        // Remove from game state
        gameState.removePlayer(socket.id);

        // Broadcast to others
        io.emit('playerLeft', { socketId: socket.id });

        console.log(`👋 Player disconnected: ${player.username}`);
      }
    });
  },

  handleMove(socket, io, gameState, { x, y }) {
    gameState.updatePlayerPosition(socket.id, x, y);

    // Broadcast to others
    socket.broadcast.emit('playerMoved', {
      socketId: socket.id,
      x,
      y
    });
  },

  handleAttack(socket, io, gameState, { monsterId }) {
    const player = gameState.getPlayer(socket.id);
    const monster = gameState.getMonster(monsterId);

    if (!player || !monster) {
      return;
    }

    // Check if monster is alive
    if (monster.health <= 0) {
      socket.emit('attackResult', { error: 'Monster is dead' });
      return;
    }

    // Validate distance (must be within 100 pixels)
    const distance = Math.sqrt(Math.pow(player.x - monster.x, 2) + Math.pow(player.y - monster.y, 2));
    if (distance > 100) {
      socket.emit('attackResult', { error: 'Too far away' });
      return;
    }

    // Perform attack
    const result = CombatSystem.attack(player, monster);

    // Send result to attacker (includes hitsplat data)
    socket.emit('attackResult', {
      damage: result.damage,
      xp: result.xp,
      killed: result.killed,
      loot: result.loot,
      levelUp: result.levelUp
    });

    // Broadcast damage to all players (for hitsplats)
    io.emit('monsterDamaged', {
      monsterId: monster.id,
      health: monster.health,
      maxHealth: monster.maxHealth,
      damage: result.damage,
      attackerId: socket.id,
      attackerName: player.username
    });

    // If killed, broadcast and drop loot on ground
    if (result.killed) {
      io.emit('monsterKilled', { monsterId: monster.id });

      if (result.loot) {
        console.log('💎 Loot dropped:', result.loot);

        // Always drop loot on ground at monster's position
        const groundItemId = gameState.addGroundItem(
          result.loot.item_id,
          result.loot.quantity,
          monster.x,
          monster.y
        );
        const groundItem = gameState.getGroundItem(groundItemId);
        console.log('📦 Ground item created:', groundItem);

        io.emit('groundItemSpawned', groundItem);

        // Send notification about loot drop
        socket.emit('lootDropped', {
          item: result.loot,
          rarity: result.loot.rarity
        });
      } else {
        console.log('❌ No loot dropped from monster');
      }
    }

    // Send skill update
    socket.emit('skillUpdate', {
      skill: 'combat',
      level: player.skills.combat.level,
      xp: player.skills.combat.xp
    });
  },

  handleFish(socket, io, gameState, { spotId }) {
    const player = gameState.getPlayer(socket.id);
    const spot = gameState.getFishingSpot(spotId);

    if (!player || !spot) {
      return;
    }

    // Check if spot is available
    if (!spot.available) {
      socket.emit('fishingResult', { error: 'Fishing spot depleted' });
      return;
    }

    // Validate distance
    const distance = Math.sqrt(Math.pow(player.x - spot.x, 2) + Math.pow(player.y - spot.y, 2));
    if (distance > 100) {
      socket.emit('fishingResult', { error: 'Too far away' });
      return;
    }

    // 80% success rate
    const success = Math.random() < 0.8;

    if (!success) {
      socket.emit('fishingResult', { success: false, message: 'You failed to catch anything.' });
      return;
    }

    // Caught a fish
    const fish = { item_id: 'fish', quantity: 1 };
    const added = ItemSystem.addToInventory(player, fish);

    if (!added) {
      socket.emit('fishingResult', { error: 'Inventory full' });
      return;
    }

    // Award XP
    const xpGained = 15;
    const levelUpResult = SkillSystem.addXP(player, 'fishing', xpGained);

    // Mark spot as depleted temporarily
    spot.available = false;
    spot.lastUsed = Date.now();

    // Send results
    socket.emit('fishingResult', {
      success: true,
      item: fish,
      xp: xpGained,
      levelUp: levelUpResult.leveledUp ? levelUpResult : null
    });

    socket.emit('inventoryUpdate', { inventory: player.inventory });
    socket.emit('skillUpdate', {
      skill: 'fishing',
      level: player.skills.fishing.level,
      xp: player.skills.fishing.xp
    });
  },

  handleChop(socket, io, gameState, { treeId }) {
    const player = gameState.getPlayer(socket.id);
    const tree = gameState.getTree(treeId);

    if (!player || !tree) {
      return;
    }

    // Check if tree is available
    if (!tree.available) {
      socket.emit('choppingResult', { error: 'Tree already chopped' });
      return;
    }

    // Validate distance
    const distance = Math.sqrt(Math.pow(player.x - tree.x, 2) + Math.pow(player.y - tree.y, 2));
    if (distance > 100) {
      socket.emit('choppingResult', { error: 'Too far away' });
      return;
    }

    // Success (always succeeds for simplicity)
    const logs = { item_id: 'logs', quantity: 1 };
    const added = ItemSystem.addToInventory(player, logs);

    if (!added) {
      socket.emit('choppingResult', { error: 'Inventory full' });
      return;
    }

    // Award XP
    const xpGained = 20;
    const levelUpResult = SkillSystem.addXP(player, 'woodcutting', xpGained);

    // Mark tree as chopped
    tree.available = false;
    tree.lastChopped = Date.now();

    // Broadcast tree chopped
    io.emit('treeChopped', { treeId: tree.id });

    // Send results
    socket.emit('choppingResult', {
      success: true,
      item: logs,
      xp: xpGained,
      levelUp: levelUpResult.leveledUp ? levelUpResult : null
    });

    socket.emit('inventoryUpdate', { inventory: player.inventory });
    socket.emit('skillUpdate', {
      skill: 'woodcutting',
      level: player.skills.woodcutting.level,
      xp: player.skills.woodcutting.xp
    });
  },

  handleUseItem(socket, io, gameState, { itemId, slot }) {
    const player = gameState.getPlayer(socket.id);

    if (!player) {
      return;
    }

    const result = ItemSystem.useItem(player, itemId, slot);

    if (!result.success) {
      socket.emit('useItemResult', { error: result.error });
      return;
    }

    // If item was consumed, send updates
    if (result.action === 'heal') {
      socket.emit('useItemResult', { success: true, action: 'heal', amount: result.amount });
      socket.emit('healthUpdate', { health: result.newHealth, maxHealth: player.maxHealth });
      socket.emit('inventoryUpdate', { inventory: player.inventory });
    } else if (result.action === 'place_fire') {
      // Will be handled by placeFirepit
      socket.emit('useItemResult', { success: true, action: 'place_fire', requiresPosition: true });
    }
  },

  handlePlaceFirepit(socket, io, gameState, { x, y }) {
    const player = gameState.getPlayer(socket.id);

    if (!player) {
      return;
    }

    // Check if player has logs
    const logsIndex = player.inventory.findIndex(item => item.item_id === 'logs');

    if (logsIndex === -1) {
      socket.emit('placeFirepitResult', { error: 'No logs in inventory' });
      return;
    }

    // Remove 1 log
    const logsSlot = player.inventory[logsIndex].slot;
    ItemSystem.removeFromInventory(player, logsSlot, 1);

    // Place fire
    const fireId = `fire_${Date.now()}_${socket.id}`;
    gameState.addFire(fireId, {
      id: fireId,
      x,
      y,
      placedBy: socket.id,
      placedAt: Date.now()
    });

    // Broadcast fire placement
    io.emit('firePlaced', {
      id: fireId, // Use 'id' to match client's expectation
      x,
      y,
      placedBy: player.username
    });

    socket.emit('inventoryUpdate', { inventory: player.inventory });
    socket.emit('placeFirepitResult', { success: true });
  },

  handlePickupGroundItem(socket, io, gameState, { groundItemId }) {
    const player = gameState.getPlayer(socket.id);
    const groundItem = gameState.getGroundItem(groundItemId);

    if (!player || !groundItem) {
      return;
    }

    // Check distance (must be within 100 pixels)
    const distance = Math.sqrt(
      Math.pow(player.x - groundItem.x, 2) + Math.pow(player.y - groundItem.y, 2)
    );
    if (distance > 100) {
      socket.emit('pickupResult', { error: 'Too far away' });
      return;
    }

    // Try to add to inventory
    const added = ItemSystem.addToInventory(player, {
      item_id: groundItem.itemId,
      quantity: groundItem.quantity
    });

    if (added) {
      // Remove from ground
      gameState.removeGroundItem(groundItemId);

      // Broadcast removal
      io.emit('groundItemPickedUp', { groundItemId });

      // Update player inventory
      socket.emit('inventoryUpdate', { inventory: player.inventory });
      socket.emit('pickupResult', {
        success: true,
        item: { item_id: groundItem.itemId, quantity: groundItem.quantity }
      });
    } else {
      socket.emit('pickupResult', { error: 'Inventory full' });
    }
  }
};
