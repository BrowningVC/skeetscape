class GameState {
  constructor() {
    this.players = new Map(); // socketId -> playerData
    this.monsters = new Map(); // monsterId -> monsterData
    this.trees = new Map(); // treeId -> treeData
    this.fishingSpots = new Map(); // spotId -> spotData
    this.fires = new Map(); // fireId -> fireData
    this.groundItems = new Map(); // groundItemId -> groundItemData
    this.nextGroundItemId = 0;

    this.initializeWorld();
  }

  // Initialize game world entities
  initializeWorld() {
    // Spawn 5 monsters around the farm area
    const monsterSpawns = [
      { x: 600, y: 400 },
      { x: 700, y: 450 },
      { x: 650, y: 500 },
      { x: 550, y: 480 },
      { x: 720, y: 380 }
    ];

    monsterSpawns.forEach((spawn, index) => {
      this.monsters.set(`monster_${index}`, {
        id: `monster_${index}`,
        x: spawn.x,
        y: spawn.y,
        spawnX: spawn.x, // Store original spawn point
        spawnY: spawn.y,
        health: 50,
        maxHealth: 50,
        type: 'goblin',
        lastRespawn: Date.now(),
        target: null, // Target player socketId
        lastAttack: 0, // Last attack timestamp
        attackCooldown: 3000 // 3 seconds between attacks
      });
    });

    // Spawn 3 fishing spots at river
    const fishingSpawns = [
      { x: 300, y: 200 },
      { x: 350, y: 220 },
      { x: 400, y: 200 }
    ];

    fishingSpawns.forEach((spawn, index) => {
      this.fishingSpots.set(`spot_${index}`, {
        id: `spot_${index}`,
        x: spawn.x,
        y: spawn.y,
        available: true,
        lastUsed: 0
      });
    });

    // Spawn 8 trees around the map
    const treeSpawns = [
      { x: 200, y: 400 },
      { x: 250, y: 420 },
      { x: 200, y: 480 },
      { x: 500, y: 300 },
      { x: 550, y: 280 },
      { x: 600, y: 320 },
      { x: 300, y: 500 },
      { x: 350, y: 520 }
    ];

    treeSpawns.forEach((spawn, index) => {
      this.trees.set(`tree_${index}`, {
        id: `tree_${index}`,
        x: spawn.x,
        y: spawn.y,
        available: true,
        lastChopped: 0
      });
    });

    console.log(`✅ World initialized: ${this.monsters.size} monsters, ${this.fishingSpots.size} fishing spots, ${this.trees.size} trees`);
  }

  // Player management
  addPlayer(socketId, playerData) {
    this.players.set(socketId, {
      ...playerData,
      socketId,
      lastUpdate: Date.now()
    });
  }

  removePlayer(socketId) {
    this.players.delete(socketId);
  }

  getPlayer(socketId) {
    return this.players.get(socketId);
  }

  updatePlayerPosition(socketId, x, y) {
    const player = this.players.get(socketId);
    if (player) {
      player.x = x;
      player.y = y;
      player.lastUpdate = Date.now();
    }
  }

  // Get all players except the specified one
  getOtherPlayers(socketId) {
    const others = [];
    this.players.forEach((player, id) => {
      if (id !== socketId) {
        others.push({
          socketId: id,
          userId: player.userId,
          username: player.username,
          x: player.x,
          y: player.y,
          health: player.health,
          maxHealth: player.maxHealth
        });
      }
    });
    return others;
  }

  // Get all players
  getAllPlayers() {
    return Array.from(this.players.values());
  }

  // Monster management
  getMonster(monsterId) {
    return this.monsters.get(monsterId);
  }

  getAllMonsters() {
    return Array.from(this.monsters.values());
  }

  respawnMonster(monsterId) {
    const monster = this.monsters.get(monsterId);
    if (monster) {
      monster.health = monster.maxHealth;
      monster.lastRespawn = Date.now();
      monster.target = null;
      monster.lastAttack = 0;
      // Reset to spawn position
      monster.x = monster.spawnX;
      monster.y = monster.spawnY;
    }
  }

  // Tree management
  getTree(treeId) {
    return this.trees.get(treeId);
  }

  getAllTrees() {
    return Array.from(this.trees.values());
  }

  // Fishing spot management
  getFishingSpot(spotId) {
    return this.fishingSpots.get(spotId);
  }

  getAllFishingSpots() {
    return Array.from(this.fishingSpots.values());
  }

  // Fire management
  addFire(fireId, fireData) {
    this.fires.set(fireId, fireData);
  }

  removeFire(fireId) {
    this.fires.delete(fireId);
  }

  getAllFires() {
    return Array.from(this.fires.values());
  }

  // Get players within range of a position
  getPlayersInRange(x, y, range) {
    const nearbyPlayers = [];
    this.players.forEach((player, socketId) => {
      const distance = Math.sqrt(Math.pow(player.x - x, 2) + Math.pow(player.y - y, 2));
      if (distance <= range) {
        nearbyPlayers.push({ socketId, player });
      }
    });
    return nearbyPlayers;
  }

  // Ground item management
  addGroundItem(itemId, quantity, x, y) {
    const groundItemId = `ground_${this.nextGroundItemId++}`;
    this.groundItems.set(groundItemId, {
      id: groundItemId,
      itemId,
      quantity,
      x,
      y,
      droppedAt: Date.now()
    });
    return groundItemId;
  }

  removeGroundItem(groundItemId) {
    this.groundItems.delete(groundItemId);
  }

  getGroundItem(groundItemId) {
    return this.groundItems.get(groundItemId);
  }

  getAllGroundItems() {
    return Array.from(this.groundItems.values());
  }
}

module.exports = GameState;
