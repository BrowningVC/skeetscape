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

    // Load LPC Goblin sprite sheet (64x64 frames, full animation set)
    console.log('📦 Loading LPC goblin sprite from:', lpcPath + 'goblin.png');
    this.load.spritesheet('goblin', lpcPath + 'goblin.png', {
      frameWidth: 64,
      frameHeight: 64
    });

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

    // Goblin animations (LPC format: 96 columns x 16 rows = 1536 frames)
    // Row 8-11 contain walk animations (like player)
    // Row 8: Walk up, Row 9: Walk left, Row 10: Walk down, Row 11: Walk right
    // Each animation is 9 frames

    this.anims.create({
      key: 'goblin_walk_up',
      frames: this.anims.generateFrameNumbers('goblin', { start: 768, end: 776 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'goblin_walk_left',
      frames: this.anims.generateFrameNumbers('goblin', { start: 864, end: 872 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'goblin_walk_down',
      frames: this.anims.generateFrameNumbers('goblin', { start: 960, end: 968 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'goblin_walk_right',
      frames: this.anims.generateFrameNumbers('goblin', { start: 1056, end: 1064 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'goblin_idle',
      frames: [{ key: 'goblin', frame: 964 }], // walk_down middle frame
      frameRate: 1
    });

    // Goblin slash animations (Row 12-15: Slash up, left, down, right)
    this.anims.create({
      key: 'goblin_slash_up',
      frames: this.anims.generateFrameNumbers('goblin', { start: 1152, end: 1157 }),
      frameRate: 12,
      repeat: 0
    });

    this.anims.create({
      key: 'goblin_slash_left',
      frames: this.anims.generateFrameNumbers('goblin', { start: 1248, end: 1253 }),
      frameRate: 12,
      repeat: 0
    });

    this.anims.create({
      key: 'goblin_slash_down',
      frames: this.anims.generateFrameNumbers('goblin', { start: 1344, end: 1349 }),
      frameRate: 12,
      repeat: 0
    });

    this.anims.create({
      key: 'goblin_slash_right',
      frames: this.anims.generateFrameNumbers('goblin', { start: 1440, end: 1445 }),
      frameRate: 12,
      repeat: 0
    });

    // Keep placeholder for backward compatibility
    this.anims.create({
      key: 'monster_idle',
      frames: [{ key: 'goblin', frame: 964 }],
      frameRate: 1
    });

    // Debug: Check if sprites loaded correctly
    const playerTexture = this.textures.get('player');
    const goblinTexture = this.textures.get('goblin');
    console.log('🎨 Player texture loaded:', playerTexture.frameTotal, 'frames');
    console.log('🎨 Goblin texture loaded:', goblinTexture.frameTotal, 'frames');

    console.log('✅ Boot scene complete, LPC (OSRS-style) pixel art loaded');
    this.scene.start('LoginScene');
  }

  createPlaceholderAssets() {
    // Create placeholder graphics for items not yet in LPC pack
    // Note: Monster/goblin sprite is now loaded from LPC assets

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
