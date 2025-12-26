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

    // Load LPC (Liberated Pixel Cup) character sprites - OSRS-style pixel art
    const lpcPath = 'assets/lpc/';
    const tilesetsPath = 'assets/tilesets/';

    // Load character sprite sheets (64x64 LPC Universal format - transparent background)
    console.log('📦 Loading LPC player sprite from:', lpcPath + 'player_human_male.png');
    this.load.spritesheet('player', lpcPath + 'player_human_male.png', {
      frameWidth: 64,
      frameHeight: 64
    });

    // Monster sprite will be created as placeholder in createPlaceholderAssets()
    // Goblin sprite is too complex (6144x1024, 1536 frames)

    // Load environment tilesets from Cainos pack (original graphics)
    console.log('📦 Loading grass tileset from:', tilesetsPath + 'grass.png');
    this.load.image('tileset_grass', tilesetsPath + 'grass.png');

    console.log('📦 Loading stone tileset from:', tilesetsPath + 'stone.png');
    this.load.image('tileset_stone', tilesetsPath + 'stone.png');

    // Load water and grass tileset (96x416, 32x32 tiles, CC0 license from OpenGameArt)
    console.log('📦 Loading water/grass tileset from:', 'assets/watergrass.png');
    this.load.image('tileset_water', 'assets/watergrass.png');

    // Load tree from LPC
    this.load.image('tree', lpcPath + 'tree.png');

    // Create placeholder graphics for items not yet in LPC pack
    this.createPlaceholderAssets();
  }

  create() {
    // Create player animations for LPC Universal sprite sheet
    // LPC Universal format: 13 columns x 21 rows = 273 frames
    // Rows 8-11 contain walk animations (9 frames each)
    // Row 8: Walk up
    // Row 9: Walk left
    // Row 10: Walk down
    // Row 11: Walk right

    this.anims.create({
      key: 'player_walk_up',
      frames: this.anims.generateFrameNumbers('player', { start: 104, end: 112 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'player_walk_left',
      frames: this.anims.generateFrameNumbers('player', { start: 117, end: 125 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'player_walk_down',
      frames: this.anims.generateFrameNumbers('player', { start: 130, end: 138 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'player_walk_right',
      frames: this.anims.generateFrameNumbers('player', { start: 143, end: 151 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'player_idle_down',
      frames: [{ key: 'player', frame: 134 }],
      frameRate: 1
    });

    // Monster idle animation - use placeholder texture
    this.anims.create({
      key: 'monster_idle',
      frames: [{ key: 'monster_placeholder', frame: 0 }],
      frameRate: 1
    });

    // Debug: Check if sprites loaded correctly
    const playerTexture = this.textures.get('player');
    console.log('🎨 Player texture loaded:', playerTexture.frameTotal, 'frames');
    console.log('🎨 Monster placeholder created');

    console.log('✅ Boot scene complete, LPC (OSRS-style) pixel art loaded');
    this.scene.start('LoginScene');
  }

  createPlaceholderAssets() {
    // Create placeholder graphics for items not yet in LPC pack

    // Monster placeholder - simple red/brown creature
    const monsterGraphics = this.add.graphics();
    // Body
    monsterGraphics.fillStyle(0x8b0000, 1); // Dark red
    monsterGraphics.fillCircle(16, 20, 12);
    // Head
    monsterGraphics.fillStyle(0xa52a2a, 1); // Brown
    monsterGraphics.fillCircle(16, 12, 8);
    // Eyes
    monsterGraphics.fillStyle(0xffff00, 1); // Yellow
    monsterGraphics.fillCircle(12, 11, 2);
    monsterGraphics.fillCircle(20, 11, 2);
    // Horns
    monsterGraphics.fillStyle(0x654321, 1);
    monsterGraphics.fillTriangle(10, 8, 8, 4, 12, 6);
    monsterGraphics.fillTriangle(22, 8, 24, 4, 20, 6);
    monsterGraphics.generateTexture('monster_placeholder', 32, 32);
    monsterGraphics.destroy();

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
