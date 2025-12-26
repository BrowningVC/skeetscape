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
    });

    // Load Cainos pixel art assets
    const assetPath = 'assets/sprites/Pixel Art Top Down - Basic v1.2.2/Texture/';

    // Load sprite sheets
    this.load.spritesheet('player', assetPath + 'TX Player.png', {
      frameWidth: 32,
      frameHeight: 32
    });

    this.load.image('tileset_grass', assetPath + 'TX Tileset Grass.png');
    this.load.image('tileset_stone', assetPath + 'TX Tileset Stone Ground.png');
    this.load.image('tileset_wall', assetPath + 'TX Tileset Wall.png');
    this.load.image('plants', assetPath + 'TX Plant.png');
    this.load.image('props', assetPath + 'TX Props.png');
    this.load.image('struct', assetPath + 'TX Struct.png');
    this.load.image('shadow', assetPath + 'TX Shadow.png');

    // Still create some placeholder graphics for items not in the pack
    this.createPlaceholderAssets();
  }

  create() {
    // Create player animations from the sprite sheet
    this.anims.create({
      key: 'player_idle_down',
      frames: [{ key: 'player', frame: 0 }],
      frameRate: 1
    });

    this.anims.create({
      key: 'player_walk_down',
      frames: this.anims.generateFrameNumbers('player', { start: 0, end: 1 }),
      frameRate: 8,
      repeat: -1
    });

    this.anims.create({
      key: 'player_walk_up',
      frames: this.anims.generateFrameNumbers('player', { start: 4, end: 5 }),
      frameRate: 8,
      repeat: -1
    });

    this.anims.create({
      key: 'player_walk_left',
      frames: this.anims.generateFrameNumbers('player', { start: 8, end: 9 }),
      frameRate: 8,
      repeat: -1
    });

    this.anims.create({
      key: 'player_walk_right',
      frames: this.anims.generateFrameNumbers('player', { start: 12, end: 13 }),
      frameRate: 8,
      repeat: -1
    });

    console.log('✅ Boot scene complete, Cainos pixel art loaded');
    this.scene.start('LoginScene');
  }

  createPlaceholderAssets() {
    // Create placeholder graphics for items not in the Cainos pack
    // Note: Player sprite is now loaded from the actual sprite sheet, not generated here

    // Monster placeholder - red goblin-like creature
    const monsterGraphics = this.add.graphics();
    // Body
    monsterGraphics.fillStyle(0xe74c3c);
    monsterGraphics.fillRect(6, 14, 20, 14);
    // Head
    monsterGraphics.fillStyle(0xc0392b);
    monsterGraphics.fillRect(8, 8, 16, 10);
    // Eyes (angry)
    monsterGraphics.fillStyle(0xffff00);
    monsterGraphics.fillRect(11, 12, 3, 3);
    monsterGraphics.fillRect(18, 12, 3, 3);
    // Horns
    monsterGraphics.fillStyle(0x8b0000);
    monsterGraphics.fillRect(7, 8, 3, 4);
    monsterGraphics.fillRect(22, 8, 3, 4);
    monsterGraphics.generateTexture('monster', 32, 32);
    monsterGraphics.destroy();

    // Tree placeholder - pixelated tree
    const treeGraphics = this.add.graphics();
    // Trunk
    treeGraphics.fillStyle(0x8b4513);
    treeGraphics.fillRect(12, 24, 8, 24);
    // Leaves (layered)
    treeGraphics.fillStyle(0x2d5016);
    treeGraphics.fillRect(4, 12, 24, 16);
    treeGraphics.fillStyle(0x27ae60);
    treeGraphics.fillRect(6, 8, 20, 12);
    treeGraphics.fillStyle(0x52c77a);
    treeGraphics.fillRect(8, 6, 16, 8);
    treeGraphics.generateTexture('tree', 32, 48);
    treeGraphics.destroy();

    // Tree stump placeholder
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
