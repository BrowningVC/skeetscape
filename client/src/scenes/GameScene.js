import { GAME_WIDTH, GAME_HEIGHT, PLAYER_SPEED, COLORS } from '../utils/Constants.js';
import socketManager from '../network/SocketManager.js';
import Monster from '../entities/Monster.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
    this.socketManager = socketManager;
    this.player = null;
    this.otherPlayers = new Map();
    this.monsters = new Map();
    this.trees = new Map();
    this.fishingSpots = new Map();
    this.fires = new Map();
    this.cursors = null;
    this.lastMoveEmit = 0;
    this.playerData = null;
  }

  create() {
    console.log('🎮 GameScene created');

    // Create simple background
    this.cameras.main.setBackgroundColor('#8fbc8f');

    // Draw simple map zones
    this.drawMapZones();

    // Set up input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };

    // Set up socket listeners
    console.log('🔌 Setting up socket listeners...');
    this.setupSocketListeners();

    // Set world bounds
    this.physics.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);

    console.log('✅ GameScene setup complete, waiting for init event...');
  }

  drawMapZones() {
    const tileSize = 32;
    const graphics = this.add.graphics();

    // Base grass layer (entire map)
    graphics.fillStyle(0x7cb342, 1);
    graphics.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Add grass texture pattern
    graphics.fillStyle(0x8bc34a, 1);
    for (let x = 0; x < GAME_WIDTH; x += tileSize) {
      for (let y = 0; y < GAME_HEIGHT; y += tileSize) {
        if (Math.random() > 0.7) {
          graphics.fillRect(x + Math.random() * 8, y + Math.random() * 8, 4, 4);
        }
      }
    }

    // River with flowing water pattern
    const riverY = 180;
    const riverHeight = 80;
    graphics.fillStyle(0x42a5f5, 1);
    graphics.fillRect(200, riverY, 400, riverHeight);
    // Water highlights
    graphics.fillStyle(0x64b5f6, 0.6);
    for (let i = 0; i < 20; i++) {
      graphics.fillRect(200 + Math.random() * 400, riverY + Math.random() * riverHeight,
                       10 + Math.random() * 20, 3);
    }
    // River banks (darker)
    graphics.fillStyle(0x5d4037, 1);
    graphics.fillRect(200, riverY - 4, 400, 4);
    graphics.fillRect(200, riverY + riverHeight, 400, 4);

    // Town buildings
    const townX = 100;
    const townY = 80;

    // Stone paths in town
    graphics.fillStyle(0x9e9e9e, 1);
    graphics.fillRect(townX + 40, townY, 200, 16);
    graphics.fillRect(townX + 40, townY + 80, 200, 16);
    graphics.fillRect(townX + 40, townY, 16, 160);
    graphics.fillRect(townX + 224, townY, 16, 160);

    // Path texture
    graphics.fillStyle(0x757575, 1);
    for (let i = 0; i < 30; i++) {
      const px = townX + 40 + Math.random() * 200;
      const py = townY + Math.random() * 160;
      graphics.fillRect(px, py, 2, 2);
    }

    // Building 1 (left)
    graphics.fillStyle(0x8d6e63, 1);
    graphics.fillRect(townX + 60, townY + 20, 60, 50);
    graphics.fillStyle(0x6d4c41, 1); // roof
    graphics.fillRect(townX + 55, townY + 10, 70, 15);
    graphics.fillStyle(0x5d4037, 1); // door
    graphics.fillRect(townX + 80, townY + 45, 20, 25);
    graphics.fillStyle(0xffeb3b, 1); // windows
    graphics.fillRect(townX + 70, townY + 30, 10, 10);
    graphics.fillRect(townX + 95, townY + 30, 10, 10);

    // Building 2 (right)
    graphics.fillStyle(0x8d6e63, 1);
    graphics.fillRect(townX + 160, townY + 20, 60, 50);
    graphics.fillStyle(0x6d4c41, 1);
    graphics.fillRect(townX + 155, townY + 10, 70, 15);
    graphics.fillStyle(0x5d4037, 1);
    graphics.fillRect(townX + 180, townY + 45, 20, 25);
    graphics.fillStyle(0xffeb3b, 1);
    graphics.fillRect(townX + 170, townY + 30, 10, 10);
    graphics.fillRect(townX + 195, townY + 30, 10, 10);

    // Building 3 (bottom)
    graphics.fillStyle(0x8d6e63, 1);
    graphics.fillRect(townX + 110, townY + 100, 60, 50);
    graphics.fillStyle(0x6d4c41, 1);
    graphics.fillRect(townX + 105, townY + 90, 70, 15);
    graphics.fillStyle(0x5d4037, 1);
    graphics.fillRect(townX + 130, townY + 125, 20, 25);
    graphics.fillStyle(0xffeb3b, 1);
    graphics.fillRect(townX + 120, townY + 110, 10, 10);
    graphics.fillRect(townX + 145, townY + 110, 10, 10);

    // Farm area with tilled soil
    const farmX = 500;
    const farmY = 320;

    // Dirt/soil base
    graphics.fillStyle(0x8d6e63, 1);
    graphics.fillRect(farmX, farmY, 280, 260);

    // Crop rows (tilled soil)
    graphics.fillStyle(0x6d4c41, 1);
    for (let row = 0; row < 8; row++) {
      graphics.fillRect(farmX + 20, farmY + 20 + (row * 30), 240, 16);
    }

    // Crop texture (small plants)
    graphics.fillStyle(0x558b2f, 1);
    for (let i = 0; i < 60; i++) {
      const cx = farmX + 20 + Math.random() * 240;
      const cy = farmY + 20 + Math.random() * 240;
      graphics.fillRect(cx, cy, 3, 4);
    }

    // Farm fence
    graphics.fillStyle(0x5d4037, 1);
    // Top fence
    for (let i = 0; i < 9; i++) {
      graphics.fillRect(farmX + (i * 32), farmY - 8, 4, 12);
    }
    // Bottom fence
    for (let i = 0; i < 9; i++) {
      graphics.fillRect(farmX + (i * 32), farmY + 260, 4, 12);
    }
    // Left fence
    for (let i = 0; i < 9; i++) {
      graphics.fillRect(farmX - 8, farmY + (i * 32), 12, 4);
    }
    // Right fence
    for (let i = 0; i < 9; i++) {
      graphics.fillRect(farmX + 280, farmY + (i * 32), 12, 4);
    }

    // Path from town to farm
    graphics.fillStyle(0x9e9e9e, 1);
    graphics.fillRect(240, 240, 16, 80);
    graphics.fillRect(240, 320, 260, 16);

    // Path stones
    graphics.fillStyle(0x757575, 1);
    for (let i = 0; i < 40; i++) {
      const px = 240 + Math.random() * 260;
      const py = 240 + Math.random() * 96;
      graphics.fillRect(px, py, 2, 2);
    }

    // Add some decorative flowers around the map
    const flowerColors = [0xff1744, 0xe91e63, 0x9c27b0, 0xffeb3b];
    for (let i = 0; i < 30; i++) {
      const fx = Math.random() * GAME_WIDTH;
      const fy = Math.random() * GAME_HEIGHT;
      // Don't put flowers on paths, buildings, river, or farm
      if (fx < 100 || fx > 480 || (fy > 180 && fy < 260) || (fx > 500 && fy > 320)) {
        continue;
      }
      const color = flowerColors[Math.floor(Math.random() * flowerColors.length)];
      graphics.fillStyle(color, 1);
      graphics.fillCircle(fx, fy, 3);
      graphics.fillStyle(0x558b2f, 1);
      graphics.fillRect(fx - 1, fy + 2, 2, 4);
    }

    // Add text labels
    this.add.text(200, 120, 'TOWN', {
      font: 'bold 16px Arial',
      fill: '#333',
      stroke: '#fff',
      strokeThickness: 2
    });
    this.add.text(600, 360, 'FARM', {
      font: 'bold 16px Arial',
      fill: '#333',
      stroke: '#fff',
      strokeThickness: 2
    });
    this.add.text(350, 200, 'River', {
      font: 'bold 14px Arial',
      fill: '#fff',
      stroke: '#1565c0',
      strokeThickness: 2
    });
  }

  setupSocketListeners() {
    // Initial game state
    this.socketManager.on('init', (data) => {
      console.log('📦 Received init data:', data);
      this.playerData = data.player;

      // Create local player
      this.createPlayer(data.player);

      // Create other players
      data.otherPlayers.forEach((playerData) => {
        this.createOtherPlayer(playerData);
      });

      // Create monsters
      data.monsters.forEach((monsterData) => {
        this.createMonster(monsterData);
      });

      // Create trees
      data.trees.forEach((treeData) => {
        this.createTree(treeData);
      });

      // Create fishing spots
      data.fishingSpots.forEach((spotData) => {
        this.createFishingSpot(spotData);
      });

      // Create fires
      data.fires.forEach((fireData) => {
        this.createFire(fireData);
      });
    });

    // Player joined
    this.socketManager.on('playerJoined', (data) => {
      this.createOtherPlayer(data);
    });

    // Player left
    this.socketManager.on('playerLeft', (data) => {
      const otherPlayer = this.otherPlayers.get(data.socketId);
      if (otherPlayer) {
        otherPlayer.nameText.destroy();
        otherPlayer.healthBarBg.destroy();
        otherPlayer.healthBar.destroy();
        otherPlayer.destroy();
        this.otherPlayers.delete(data.socketId);
      }
    });

    // Player moved
    this.socketManager.on('playerMoved', (data) => {
      const otherPlayer = this.otherPlayers.get(data.socketId);
      if (otherPlayer) {
        this.tweens.add({
          targets: otherPlayer,
          x: data.x,
          y: data.y,
          duration: 100
        });
      }
    });

    // Monster damaged (show hitsplat)
    this.socketManager.on('monsterDamaged', (data) => {
      const monster = this.monsters.get(data.monsterId);
      if (monster) {
        monster.updateHealth(data.health);
        monster.showHitsplat(data.damage);
      }
    });

    // Monster killed
    this.socketManager.on('monsterKilled', (data) => {
      const monster = this.monsters.get(data.monsterId);
      if (monster) {
        monster.playDeathAnimation();
      }
    });

    // Monster spawned
    this.socketManager.on('monsterSpawned', (data) => {
      const monster = this.monsters.get(data.monsterId);
      if (monster) {
        monster.respawn(data.x, data.y, data.health, data.maxHealth);
      }
    });

    // Monster positions (periodic updates)
    this.socketManager.on('monsterPositions', (data) => {
      data.monsters.forEach((monsterData) => {
        const monster = this.monsters.get(monsterData.id);
        if (monster && monster.monsterHealth > 0) {
          this.tweens.add({
            targets: monster,
            x: monsterData.x,
            y: monsterData.y,
            duration: 50
          });
        }
      });
    });

    // Attack result
    this.socketManager.on('attackResult', (data) => {
      if (data.error) {
        this.showMessage(data.error, 0xff0000);
      } else {
        this.showMessage(`Hit for ${data.damage}! (+${data.xp} XP)`, 0x00ff00);

        if (data.loot) {
          const lootMsg = data.loot.rarity === 'ultra_rare' ? `🎉 ULTRA RARE: ${data.loot.item_id}!` :
                          data.loot.rarity === 'very_rare' ? `✨ VERY RARE: ${data.loot.item_id}!` :
                          `Loot: ${data.loot.item_id} x${data.loot.quantity}`;
          this.showMessage(lootMsg, 0xffd700);
        }

        if (data.levelUp) {
          this.showMessage(`🎉 Combat level up! ${data.levelUp.newLevel}`, 0xffd700);
        }
      }
    });

    // Fishing result
    this.socketManager.on('fishingResult', (data) => {
      if (data.success) {
        this.showMessage(`Caught a fish! (+${data.xp} XP)`, 0x00ff00);
        if (data.levelUp) {
          this.showMessage(`🎉 Fishing level up! ${data.levelUp.newLevel}`, 0xffd700);
        }
      } else if (data.error) {
        this.showMessage(data.error, 0xff0000);
      } else {
        this.showMessage(data.message, 0xffaa00);
      }
    });

    // Chopping result
    this.socketManager.on('choppingResult', (data) => {
      if (data.success) {
        this.showMessage(`Chopped logs! (+${data.xp} XP)`, 0x00ff00);
        if (data.levelUp) {
          this.showMessage(`🎉 Woodcutting level up! ${data.levelUp.newLevel}`, 0xffd700);
        }
      } else if (data.error) {
        this.showMessage(data.error, 0xff0000);
      }
    });

    // Tree chopped
    this.socketManager.on('treeChopped', (data) => {
      const tree = this.trees.get(data.treeId);
      if (tree) {
        tree.setTexture('tree_stump');
      }
    });

    // Tree respawned
    this.socketManager.on('treeRespawned', (data) => {
      const tree = this.trees.get(data.treeId);
      if (tree) {
        tree.setTexture('tree');
      }
    });

    // Fire placed
    this.socketManager.on('firePlaced', (data) => {
      this.createFire(data);
    });

    // Health update
    this.socketManager.on('healthUpdate', (data) => {
      if (this.player) {
        this.playerData.health = data.health;
        // UI scene will handle displaying this
      }
    });
  }

  createPlayer(playerData) {
    this.player = this.physics.add.sprite(playerData.x, playerData.y, 'player');
    this.player.setCollideWorldBounds(true);

    // Name tag
    this.player.nameText = this.add.text(this.player.x, this.player.y - 30, playerData.username || 'Player', {
      font: 'bold 12px Arial',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    });
    this.player.nameText.setOrigin(0.5);

    // Camera follow
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);
  }

  createOtherPlayer(playerData) {
    const otherPlayer = this.add.sprite(playerData.x, playerData.y, 'player');
    otherPlayer.setTint(0xaaaaff);

    // Name tag
    otherPlayer.nameText = this.add.text(playerData.x, playerData.y - 30, playerData.username, {
      font: 'bold 12px Arial',
      fill: '#ffff00',
      stroke: '#000000',
      strokeThickness: 2
    });
    otherPlayer.nameText.setOrigin(0.5);

    // Health bar
    otherPlayer.healthBarBg = this.add.graphics();
    otherPlayer.healthBar = this.add.graphics();

    this.otherPlayers.set(playerData.socketId, otherPlayer);
  }

  createMonster(monsterData) {
    const monster = new Monster(this, monsterData);
    this.monsters.set(monsterData.id, monster);
  }

  createTree(treeData) {
    const tree = this.add.sprite(treeData.x, treeData.y, treeData.available ? 'tree' : 'tree_stump');
    tree.setInteractive();
    tree.treeId = treeData.id;

    tree.on('pointerdown', () => {
      this.socketManager.emit('chop', { treeId: tree.treeId });
    });

    tree.on('pointerover', () => {
      tree.setTint(0xaaffaa);
    });

    tree.on('pointerout', () => {
      tree.clearTint();
    });

    this.trees.set(treeData.id, tree);
  }

  createFishingSpot(spotData) {
    const spot = this.add.sprite(spotData.x, spotData.y, 'fishing_spot');
    spot.setInteractive();
    spot.spotId = spotData.id;

    spot.on('pointerdown', () => {
      this.socketManager.emit('fish', { spotId: spot.spotId });
    });

    spot.on('pointerover', () => {
      spot.setTint(0xaaffff);
    });

    spot.on('pointerout', () => {
      spot.clearTint();
    });

    this.fishingSpots.set(spotData.id, spot);
  }

  createFire(fireData) {
    const fire = this.add.sprite(fireData.x, fireData.y, 'fire');
    this.fires.set(fireData.id, fire);
  }

  showMessage(text, color) {
    const message = this.add.text(GAME_WIDTH / 2, 50, text, {
      font: 'bold 16px Arial',
      fill: `#${color.toString(16).padStart(6, '0')}`,
      stroke: '#000000',
      strokeThickness: 3,
      backgroundColor: '#000000aa',
      padding: { x: 10, y: 5 }
    });
    message.setOrigin(0.5);
    message.setScrollFactor(0);
    message.setDepth(1000);

    this.tweens.add({
      targets: message,
      alpha: 0,
      y: 30,
      duration: 2000,
      delay: 1000,
      onComplete: () => {
        message.destroy();
      }
    });
  }

  update(time, delta) {
    if (!this.player) return;

    // Player movement
    const speed = PLAYER_SPEED;
    let velocityX = 0;
    let velocityY = 0;

    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      velocityX = -speed;
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      velocityX = speed;
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      velocityY = -speed;
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      velocityY = speed;
    }

    this.player.setVelocity(velocityX, velocityY);

    // Update player animation based on movement
    if (velocityX !== 0 || velocityY !== 0) {
      if (Math.abs(velocityY) > Math.abs(velocityX)) {
        // Moving more vertically
        if (velocityY < 0) {
          this.player.anims.play('player_walk_up', true);
        } else {
          this.player.anims.play('player_walk_down', true);
        }
      } else {
        // Moving more horizontally
        if (velocityX < 0) {
          this.player.anims.play('player_walk_left', true);
        } else {
          this.player.anims.play('player_walk_right', true);
        }
      }
    } else {
      this.player.anims.play('player_idle_down', true);
    }

    // Update name tag position
    this.player.nameText.setPosition(this.player.x, this.player.y - 30);

    // Emit position to server (throttled to every 100ms)
    if (time - this.lastMoveEmit > 100 && (velocityX !== 0 || velocityY !== 0)) {
      this.socketManager.emit('move', { x: this.player.x, y: this.player.y });
      this.lastMoveEmit = time;
    }

    // Update other players' name tags and health bars
    this.otherPlayers.forEach((otherPlayer) => {
      otherPlayer.nameText.setPosition(otherPlayer.x, otherPlayer.y - 30);
    });

    // Update monsters
    this.monsters.forEach((monster) => {
      monster.update();
    });
  }
}
