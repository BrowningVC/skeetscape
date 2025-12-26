export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Create loading bar
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      font: '20px Arial',
      fill: '#ffffff'
    });
    loadingText.setOrigin(0.5, 0.5);

    const percentText = this.add.text(width / 2, height / 2, '0%', {
      font: '18px Arial',
      fill: '#ffffff'
    });
    percentText.setOrigin(0.5, 0.5);

    // Update progress bar
    this.load.on('progress', (value) => {
      progressBar.clear();
      progressBar.fillStyle(0x667eea, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
      percentText.setText(parseInt(value * 100) + '%');
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
      console.log('✅ All assets loaded successfully');
    });

    this.load.on('loaderror', (file) => {
      console.error('❌ Failed to load:', file.src);
    });

    // Load LPC (Liberated Pixel Cup) assets - OSRS-style pixel art
    const lpcPath = 'assets/lpc/';

    // Load sprite sheets (64x64 LPC format)
    console.log('📦 Loading LPC player sprite from:', lpcPath + 'player_spritesheet.png');
    this.load.spritesheet('player', lpcPath + 'player_spritesheet.png', {
      frameWidth: 64,
      frameHeight: 64
    });

    console.log('📦 Loading LPC goblin sprite from:', lpcPath + 'goblin.png');
    this.load.spritesheet('monster', lpcPath + 'goblin.png', {
      frameWidth: 64,
      frameHeight: 64
    });

    // Load tilesets and environment sprites
    this.load.image('tileset_grass', lpcPath + 'tileset_grass.png');
    this.load.image('tree', lpcPath + 'tree.png');

    // Create placeholder graphics for items not yet in LPC pack
    this.createPlaceholderAssets();
  }

  create() {
    // Create player animations for LPC sprite sheet
    // LPC format: Row 0-7 for different directions with 9 frames each
    // Rows: 0=Spellcast, 1=Thrust, 2=Walk, 3=Slash, 4=Shoot, 5=Hurt, 6-7=Idle variations

    // Walking animations (row 2: up, left, down, right)
    this.anims.create({
      key: 'player_walk_up',
      frames: this.anims.generateFrameNumbers('player', { start: 0, end: 8 }),
      frameRate: 12,
      repeat: -1
    });

    this.anims.create({
      key: 'player_walk_left',
      frames: this.anims.generateFrameNumbers('player', { start: 9, end: 17 }),
      frameRate: 12,
      repeat: -1
    });

    this.anims.create({
      key: 'player_walk_down',
      frames: this.anims.generateFrameNumbers('player', { start: 18, end: 26 }),
      frameRate: 12,
      repeat: -1
    });

    this.anims.create({
      key: 'player_walk_right',
      frames: this.anims.generateFrameNumbers('player', { start: 27, end: 35 }),
      frameRate: 12,
      repeat: -1
    });

    // Idle animation (use first frame of walk down)
    this.anims.create({
      key: 'player_idle_down',
      frames: [{ key: 'player', frame: 18 }],
      frameRate: 1
    });

    console.log('✅ Boot scene complete, LPC (OSRS-style) pixel art loaded');
    this.scene.start('LoginScene');
  }

  createPlaceholderAssets() {
    // Create placeholder graphics for items not yet in LPC pack
    // Player and Monster sprites are now loaded from actual LPC spritesheets

    // Tree stump placeholder (tree is loaded from LPC)
    const stumpGraphics = this.add.graphics();
    stumpGraphics.fillStyle(0x8b4513);
    stumpGraphics.fillRect(8, 8, 16, 16);
    // Rings
    stumpGraphics.fillStyle(0x654321);
    stumpGraphics.fillRect(12, 12, 8, 8);
    stumpGraphics.fillRect(14, 14, 4, 4);
    stumpGraphics.generateTexture('tree_stump', 32, 24);
    stumpGraphics.destroy();

    // Fishing spot placeholder - water ripples
    const fishingGraphics = this.add.graphics();
    fishingGraphics.fillStyle(0x4682b4, 0.6);
    fishingGraphics.fillCircle(16, 16, 14);
    fishingGraphics.fillStyle(0x1abc9c, 0.8);
    fishingGraphics.fillCircle(16, 16, 10);
    fishingGraphics.fillStyle(0x5dade2, 0.6);
    fishingGraphics.fillCircle(16, 16, 6);
    fishingGraphics.generateTexture('fishing_spot', 32, 32);
    fishingGraphics.destroy();

    // Fire placeholder - animated-looking flames
    const fireGraphics = this.add.graphics();
    // Base
    fireGraphics.fillStyle(0x8b0000);
    fireGraphics.fillRect(10, 26, 12, 6);
    // Flames
    fireGraphics.fillStyle(0xff4500);
    fireGraphics.fillTriangle(16, 8, 8, 26, 24, 26);
    fireGraphics.fillStyle(0xff6600);
    fireGraphics.fillTriangle(16, 12, 10, 24, 22, 24);
    fireGraphics.fillStyle(0xffa500);
    fireGraphics.fillTriangle(16, 14, 12, 22, 20, 22);
    fireGraphics.fillStyle(0xffcc00);
    fireGraphics.fillTriangle(16, 16, 14, 20, 18, 20);
    fireGraphics.generateTexture('fire', 32, 32);
    fireGraphics.destroy();
  }
}
