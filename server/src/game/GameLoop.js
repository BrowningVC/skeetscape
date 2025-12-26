const SkillSystem = require('./SkillSystem');

class GameLoop {
  constructor(io, gameState) {
    this.io = io;
    this.gameState = gameState;
    this.tickRate = 50; // 50ms = 20 ticks per second
    this.tickInterval = null;
    this.ticks = 0;
  }

  start() {
    console.log('🎮 Game loop starting...');
    this.tickInterval = setInterval(() => {
      this.tick();
    }, this.tickRate);
  }

  stop() {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
      console.log('⏹️  Game loop stopped');
    }
  }

  tick() {
    this.ticks++;

    // Update monster AI (simple wander every 2 seconds)
    if (this.ticks % 40 === 0) {
      this.updateMonsterAI();
    }

    // Heal players near fires
    this.healPlayersNearFires();

    // Respawn trees and fishing spots
    this.respawnResources();

    // Despawn old fires (after 5 minutes)
    this.despawnOldFires();

    // Broadcast state updates every 1 second
    if (this.ticks % 20 === 0) {
      this.broadcastStateUpdates();
    }
  }

  updateMonsterAI() {
    this.gameState.monsters.forEach((monster) => {
      // Only move alive monsters
      if (monster.health > 0) {
        // Simple random wander
        const moveDistance = 20;
        const angle = Math.random() * Math.PI * 2;
        monster.x += Math.cos(angle) * moveDistance;
        monster.y += Math.sin(angle) * moveDistance;

        // Keep monsters within bounds (400-800, 200-600)
        monster.x = Math.max(400, Math.min(800, monster.x));
        monster.y = Math.max(200, Math.min(600, monster.y));
      }
    });
  }

  healPlayersNearFires() {
    const healAmount = 2; // HP per tick (40 HP per second at 20 TPS)
    const healRange = 100; // pixels

    this.gameState.fires.forEach((fire) => {
      const nearbyPlayers = this.gameState.getPlayersInRange(fire.x, fire.y, healRange);

      nearbyPlayers.forEach(({ socketId, player }) => {
        if (player.health < player.maxHealth) {
          player.health = Math.min(player.health + healAmount, player.maxHealth);

          // Notify player of health update
          this.io.to(socketId).emit('healthUpdate', {
            health: player.health,
            maxHealth: player.maxHealth
          });
        }
      });
    });
  }

  respawnResources() {
    const now = Date.now();
    const respawnTime = 30000; // 30 seconds

    // Respawn trees
    this.gameState.trees.forEach((tree) => {
      if (!tree.available && (now - tree.lastChopped) >= respawnTime) {
        tree.available = true;
        this.io.emit('treeRespawned', { treeId: tree.id });
      }
    });

    // Respawn fishing spots
    this.gameState.fishingSpots.forEach((spot) => {
      if (!spot.available && (now - spot.lastUsed) >= respawnTime) {
        spot.available = true;
        this.io.emit('fishingSpotRespawned', { spotId: spot.id });
      }
    });

    // Respawn dead monsters
    this.gameState.monsters.forEach((monster) => {
      if (monster.health <= 0 && (now - monster.lastRespawn) >= respawnTime) {
        this.gameState.respawnMonster(monster.id);
        this.io.emit('monsterSpawned', {
          monsterId: monster.id,
          x: monster.x,
          y: monster.y,
          health: monster.health,
          maxHealth: monster.maxHealth
        });
      }
    });
  }

  despawnOldFires() {
    const now = Date.now();
    const fireLifetime = 300000; // 5 minutes

    this.gameState.fires.forEach((fire, fireId) => {
      if ((now - fire.placedAt) >= fireLifetime) {
        this.gameState.removeFire(fireId);
        this.io.emit('fireDespawned', { fireId });
      }
    });
  }

  broadcastStateUpdates() {
    // Broadcast monster positions
    const monsterPositions = [];
    this.gameState.monsters.forEach((monster) => {
      if (monster.health > 0) {
        monsterPositions.push({
          id: monster.id,
          x: monster.x,
          y: monster.y
        });
      }
    });

    if (monsterPositions.length > 0) {
      this.io.emit('monsterPositions', { monsters: monsterPositions });
    }
  }
}

module.exports = GameLoop;
