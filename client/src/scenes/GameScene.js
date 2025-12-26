import { GAME_WIDTH, GAME_HEIGHT, PLAYER_SPEED, COLORS } from '../utils/Constants.js';
import socketManager from '../network/SocketManager.js';
import Monster from '../entities/Monster.js';
import GroundItem from '../entities/GroundItem.js';

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
    this.groundItems = new Map();
    this.cursors = null;
    this.lastMoveEmit = 0;
    this.playerData = null;
    this.treesPhysicsGroup = null; // Physics group for tree collisions
  }

  create() {
    console.log('🎮 GameScene created');

    // Create physics group for trees (before drawing map)
    this.treesPhysicsGroup = this.physics.add.staticGroup();

    // Draw map zones (grass tileset provides background)
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

    // Base grass layer - Cainos tileset
    const grassTile = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'tileset_grass');
    grassTile.setOrigin(0, 0);
    grassTile.setDepth(-2); // Behind everything

    const graphics = this.add.graphics();
    graphics.setDepth(0.5); // Above water (0) but below fishing spots (1) - for buildings, farm, decorations

    // River with water tileset (moved down to avoid town overlap)
    const riverY = 280;
    const riverHeight = 80;
    const riverX = 100;
    const riverWidth = 400;

    // Create water using tileset (32x32 tiles)
    const waterTile = this.add.tileSprite(riverX, riverY, riverWidth, riverHeight, 'tileset_water');
    waterTile.setOrigin(0, 0);
    waterTile.setDepth(0); // Above grass (-2) and stone paths (-1)

    // River banks (darker)
    graphics.fillStyle(0x5d4037, 1);
    graphics.fillRect(riverX, riverY - 4, riverWidth, 4);
    graphics.fillRect(riverX, riverY + riverHeight, riverWidth, 4);

    // Town buildings (moved higher to create walkway between town and river)
    const townX = 100;
    const townY = 30;

    // Stone paths in town - Cainos stone tileset
    const stonePath = this.add.tileSprite(townX + 40, townY, 200, 160, 'tileset_stone');
    stonePath.setOrigin(0, 0);
    stonePath.setDepth(-1); // Above grass but below everything else

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

    // Path from town to farm using Cainos tileset
    const pathVertical = this.add.tileSprite(240, 240, 16, 80, 'tileset_stone');
    pathVertical.setOrigin(0, 0);
    pathVertical.setDepth(-1); // Same as town paths
    const pathHorizontal = this.add.tileSprite(240, 320, 260, 16, 'tileset_stone');
    pathHorizontal.setOrigin(0, 0);
    pathHorizontal.setDepth(-1); // Same as town paths

    // Add some decorative flowers around the map
    const flowerColors = [0xff1744, 0xe91e63, 0x9c27b0, 0xffeb3b];
    for (let i = 0; i < 30; i++) {
      const fx = Math.random() * GAME_WIDTH;
      const fy = Math.random() * GAME_HEIGHT;
      // Don't put flowers on paths, buildings, river, or farm
      if (fx < 100 || fx > 480 || (fy > 280 && fy < 360) || (fx > 500 && fy > 320)) {
        continue;
      }
      const color = flowerColors[Math.floor(Math.random() * flowerColors.length)];
      graphics.fillStyle(color, 1);
      graphics.fillCircle(fx, fy, 3);
      graphics.fillStyle(0x558b2f, 1);
      graphics.fillRect(fx - 1, fy + 2, 2, 4);
    }

    // Add text labels
    this.add.text(200, 70, 'TOWN', {
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

    // Create collision zones (initialized here, colliders added after player creation)
    this.collisionZones = this.physics.add.staticGroup();

    // River collision zone (full river area)
    const riverCollision = this.add.rectangle(riverX + riverWidth/2, riverY + riverHeight/2, riverWidth, riverHeight);
    riverCollision.setVisible(false); // Invisible collision box
    this.physics.add.existing(riverCollision, true);
    this.collisionZones.add(riverCollision);

    // Town building collisions (centers must match visual buildings)
    const building1 = this.add.rectangle(townX + 90, townY + 45, 60, 50);
    building1.setVisible(false); // Invisible collision box
    this.physics.add.existing(building1, true);
    this.collisionZones.add(building1);

    const building2 = this.add.rectangle(townX + 190, townY + 45, 60, 50);
    building2.setVisible(false); // Invisible collision box
    this.physics.add.existing(building2, true);
    this.collisionZones.add(building2);

    const building3 = this.add.rectangle(townX + 140, townY + 125, 60, 50);
    building3.setVisible(false); // Invisible collision box
    this.physics.add.existing(building3, true);
    this.collisionZones.add(building3);

    // Farm building collision
    const farmBuilding = this.add.rectangle(farmX + 140, farmY + 130, 280, 260);
    farmBuilding.setVisible(false); // Invisible collision box
    this.physics.add.existing(farmBuilding, true);
    this.collisionZones.add(farmBuilding);
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

      // Create ground items
      data.groundItems.forEach((groundItemData) => {
        this.createGroundItem(groundItemData);
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
          // Use moveTo method to update position and play walk animations
          const targetX = monsterData.x;
          const targetY = monsterData.y;

          this.tweens.add({
            targets: monster,
            x: targetX,
            y: targetY,
            duration: 50,
            onStart: () => {
              // Calculate direction and play walk animation
              const dx = targetX - monster.x;
              const dy = targetY - monster.y;

              if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
                if (Math.abs(dx) > Math.abs(dy)) {
                  monster.play(dx > 0 ? 'goblin_walk_right' : 'goblin_walk_left', true);
                } else {
                  monster.play(dy > 0 ? 'goblin_walk_down' : 'goblin_walk_up', true);
                }
              }
            },
            onComplete: () => {
              // Return to idle when movement completes
              monster.play('goblin_idle', true);
            }
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

        if (data.levelUp) {
          this.showMessage(`🎉 Combat level up! ${data.levelUp.newLevel}`, 0xffd700);
        }
      }
    });

    // Loot dropped on ground
    this.socketManager.on('lootDropped', (data) => {
      const lootMsg = data.rarity === 'ultra_rare' ? `🎉 ULTRA RARE: ${data.item.item_id}!` :
                      data.rarity === 'very_rare' ? `✨ VERY RARE: ${data.item.item_id}!` :
                      data.rarity === 'rare' ? `💎 RARE: ${data.item.item_id}!` :
                      `Loot: ${data.item.item_id} x${data.item.quantity}`;
      const color = data.rarity === 'ultra_rare' ? 0xff00ff :
                    data.rarity === 'very_rare' ? 0x00ffff :
                    data.rarity === 'rare' ? 0xffd700 :
                    0xffffff;
      this.showMessage(lootMsg, color);
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
        // Remove collision when tree is chopped
        if (tree.body) {
          tree.body.enable = false;
        }
      }
    });

    // Tree respawned
    this.socketManager.on('treeRespawned', (data) => {
      const tree = this.trees.get(data.treeId);
      if (tree) {
        tree.setTexture('tree');
        // Re-enable collision when tree respawns
        if (tree.body) {
          tree.body.enable = true;
        }
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

    // Player damaged by monster
    this.socketManager.on('playerDamaged', (data) => {
      if (this.player) {
        this.playerData.health = data.health;
        this.showPlayerHitsplat(data.damage);
        this.cameras.main.shake(200, 0.005);
      }
    });

    // Player hit by monster (play monster attack animation)
    this.socketManager.on('playerHit', (data) => {
      const monster = this.monsters.get(data.monsterId);
      if (monster) {
        // Play attack animation
        monster.play('goblin_slash_down', true);

        // Return to idle after animation completes
        monster.once('animationcomplete', () => {
          monster.play('goblin_idle', true);
        });
      }
    });

    // Player died
    this.socketManager.on('playerDied', (data) => {
      if (this.player) {
        this.playerData.health = data.health;
        this.player.x = data.x;
        this.player.y = data.y;
        this.showMessage(data.message, 0xff0000);
        this.cameras.main.flash(500, 255, 0, 0);
      }
    });

    // Player respawned
    this.socketManager.on('playerRespawned', (data) => {
      const otherPlayer = this.otherPlayers.get(data.socketId);
      if (otherPlayer) {
        otherPlayer.x = data.x;
        otherPlayer.y = data.y;
      }
    });

    // Ground item spawned
    this.socketManager.on('groundItemSpawned', (data) => {
      console.log('📦 Ground item spawned event received:', data);
      this.createGroundItem(data);
    });

    // Ground item picked up
    this.socketManager.on('groundItemPickedUp', (data) => {
      const groundItem = this.groundItems.get(data.groundItemId);
      if (groundItem) {
        groundItem.destroy();
        this.groundItems.delete(data.groundItemId);
      }
    });
  }

  createPlayer(playerData) {
    console.log('🎮 Creating player with sprite:', 'player');
    this.player = this.physics.add.sprite(playerData.x, playerData.y, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(10); // Ensure player is above ground

    // LPC sprites are 64x64, keep at full scale for proper visibility
    this.player.setScale(1);

    console.log('✅ Player sprite created, frame count:', this.player.texture.frameTotal);

    // Name tag (adjusted offset for full-scale sprite)
    this.player.nameText = this.add.text(this.player.x, this.player.y - 40, playerData.username || 'Player', {
      font: 'bold 12px Arial',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    });
    this.player.nameText.setOrigin(0.5);

    // Camera follow
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Add collisions with static zones (river, buildings)
    this.physics.add.collider(this.player, this.collisionZones);

    // Add collisions with trees
    this.physics.add.collider(this.player, this.treesPhysicsGroup);
  }

  createOtherPlayer(playerData) {
    const otherPlayer = this.add.sprite(playerData.x, playerData.y, 'player');
    otherPlayer.setTint(0xaaaaff);
    otherPlayer.setScale(1); // Match main player scale
    otherPlayer.setDepth(10); // Same as main player

    // Name tag (adjusted offset for full-scale sprite)
    otherPlayer.nameText = this.add.text(playerData.x, playerData.y - 40, playerData.username, {
      font: 'bold 12px Arial',
      fill: '#ffff00',
      stroke: '#000000',
      strokeThickness: 2
    });
    otherPlayer.nameText.setOrigin(0.5);

    // Health bar
    otherPlayer.healthBarBg = this.add.graphics();
    otherPlayer.healthBarBg.setDepth(100); // Above players and all game objects
    otherPlayer.healthBar = this.add.graphics();
    otherPlayer.healthBar.setDepth(100); // Above players and all game objects

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
    tree.setDepth(3); // Above water (0) but below monsters (5)

    // Add physics body for collision (smaller than sprite for better interaction range)
    this.physics.add.existing(tree, true);
    tree.body.setSize(48, 48); // Smaller collision box than 64x64 sprite
    tree.body.setOffset(8, 8); // Center the collision box
    this.treesPhysicsGroup.add(tree);

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
    spot.setDepth(1); // Above water (0), should float on water surface

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
    fire.setDepth(2); // Above water (0) and fishing spots (1)
    this.fires.set(fireData.id, fire);
  }

  createGroundItem(groundItemData) {
    console.log('🎁 Creating ground item:', groundItemData);
    const groundItem = new GroundItem(this, groundItemData);
    this.groundItems.set(groundItemData.id, groundItem);
    console.log('✅ Ground item created and added to map');
  }

  showPlayerHitsplat(damage) {
    if (!this.player) return;

    const hitsplat = this.add.text(this.player.x, this.player.y - 40, `-${damage}`, {
      font: 'bold 16px Arial',
      fill: '#ff0000',
      stroke: '#000000',
      strokeThickness: 3
    });
    hitsplat.setOrigin(0.5);

    this.tweens.add({
      targets: hitsplat,
      y: hitsplat.y - 30,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => {
        hitsplat.destroy();
      }
    });
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

    // Update player animation based on movement (wrapped in try-catch to prevent breaking movement)
    try {
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
    } catch (err) {
      // Animation error - log it but don't break movement
      console.warn('Animation error:', err);
    }

    // Update name tag position (adjusted for full-scale sprite)
    this.player.nameText.setPosition(this.player.x, this.player.y - 40);

    // Emit position to server (throttled to every 100ms)
    if (time - this.lastMoveEmit > 100 && (velocityX !== 0 || velocityY !== 0)) {
      this.socketManager.emit('move', { x: this.player.x, y: this.player.y });
      this.lastMoveEmit = time;
    }

    // Update other players' name tags and health bars
    this.otherPlayers.forEach((otherPlayer) => {
      otherPlayer.nameText.setPosition(otherPlayer.x, otherPlayer.y - 40);
    });

    // Update monsters
    this.monsters.forEach((monster) => {
      monster.update();
    });
  }
}
