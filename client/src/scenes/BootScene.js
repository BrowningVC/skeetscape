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

    // Load LPC Goblin sprite sheet (704x320, 64x64 frames, 11x5 grid = 55 frames)
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

    // Goblin animations (LPC format: 11 columns x 5 rows = 55 frames)
    // Row 0 (0-10): Spellcast up
    // Row 1 (11-21): Walk down
    // Row 2 (22-32): Walk left
    // Row 3 (33-43): Walk right
    // Row 4 (44-48): Death/hurt

    this.anims.create({
      key: 'goblin_walk_down',
      frames: this.anims.generateFrameNumbers('goblin', { start: 11, end: 19 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'goblin_walk_left',
      frames: this.anims.generateFrameNumbers('goblin', { start: 22, end: 30 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'goblin_walk_right',
      frames: this.anims.generateFrameNumbers('goblin', { start: 33, end: 41 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'goblin_walk_up',
      frames: this.anims.generateFrameNumbers('goblin', { start: 0, end: 8 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'goblin_idle',
      frames: [{ key: 'goblin', frame: 15 }], // Middle frame of walk down animation
      frameRate: 1
    });

    // Slash animations - using spellcast animation for attack (row 0)
    this.anims.create({
      key: 'goblin_slash_down',
      frames: this.anims.generateFrameNumbers('goblin', { start: 0, end: 6 }),
      frameRate: 12,
      repeat: 0
    });

    this.anims.create({
      key: 'goblin_slash_left',
      frames: this.anims.generateFrameNumbers('goblin', { start: 0, end: 6 }),
      frameRate: 12,
      repeat: 0
    });

    this.anims.create({
      key: 'goblin_slash_right',
      frames: this.anims.generateFrameNumbers('goblin', { start: 0, end: 6 }),
      frameRate: 12,
      repeat: 0
    });

    this.anims.create({
      key: 'goblin_slash_up',
      frames: this.anims.generateFrameNumbers('goblin', { start: 0, end: 6 }),
      frameRate: 12,
      repeat: 0
    });

    // Keep placeholder for backward compatibility
    this.anims.create({
      key: 'monster_idle',
      frames: [{ key: 'goblin', frame: 15 }],
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

    // Create item sprites (16x16 pixel art)
    this.createItemSprites();
  }

  createItemSprites() {
    const size = 16;

    // Bones - white skull and bones
    const bones = this.add.graphics();
    bones.fillStyle(0xeeeeee);
    bones.fillRect(6, 4, 4, 4); // skull top
    bones.fillRect(5, 8, 6, 3); // skull jaw
    bones.fillStyle(0x000000);
    bones.fillRect(6, 6, 1, 1); // left eye
    bones.fillRect(9, 6, 1, 1); // right eye
    bones.fillStyle(0xdddddd);
    bones.fillRect(3, 12, 10, 2); // bone
    bones.fillRect(7, 11, 2, 4); // bone cross
    bones.generateTexture('item_bones', size, size);
    bones.destroy();

    // Raw meat - red meat chunk
    const rawMeat = this.add.graphics();
    rawMeat.fillStyle(0x8b0000);
    rawMeat.fillRect(4, 5, 8, 6);
    rawMeat.fillStyle(0xb22222);
    rawMeat.fillRect(5, 6, 6, 4);
    rawMeat.fillStyle(0xdc143c);
    rawMeat.fillRect(6, 7, 4, 2);
    rawMeat.fillStyle(0xffffff);
    rawMeat.fillRect(5, 8, 2, 1); // fat
    rawMeat.generateTexture('item_raw_meat', size, size);
    rawMeat.destroy();

    // Coins - gold stack
    const coins = this.add.graphics();
    coins.fillStyle(0xffd700);
    coins.fillCircle(8, 8, 5);
    coins.fillStyle(0xffed4e);
    coins.fillCircle(8, 7, 3);
    coins.fillStyle(0xffa500);
    coins.fillRect(7, 10, 2, 2); // coin stack shadow
    coins.fillRect(9, 10, 2, 2);
    coins.generateTexture('item_coins', size, size);
    coins.destroy();

    // Healing potion - red bottle
    const healingPotion = this.add.graphics();
    healingPotion.fillStyle(0x555555);
    healingPotion.fillRect(7, 3, 2, 2); // cork
    healingPotion.fillStyle(0x8b0000);
    healingPotion.fillRect(6, 5, 4, 7); // bottle
    healingPotion.fillStyle(0xff0000);
    healingPotion.fillRect(7, 6, 2, 5); // potion
    healingPotion.fillStyle(0xff6666);
    healingPotion.fillRect(7, 6, 1, 2); // highlight
    healingPotion.generateTexture('item_healing_potion', size, size);
    healingPotion.destroy();

    // Bronze sword - brown/orange blade
    const bronzeSword = this.add.graphics();
    bronzeSword.fillStyle(0xcd7f32);
    bronzeSword.fillRect(8, 2, 2, 10); // blade
    bronzeSword.fillStyle(0xb8860b);
    bronzeSword.fillRect(9, 2, 1, 8); // blade highlight
    bronzeSword.fillStyle(0x8b4513);
    bronzeSword.fillRect(7, 11, 4, 3); // hilt
    bronzeSword.fillStyle(0xdaa520);
    bronzeSword.fillRect(6, 12, 6, 1); // guard
    bronzeSword.generateTexture('item_bronze_sword', size, size);
    bronzeSword.destroy();

    // Leather armor - brown chestplate
    const leatherArmor = this.add.graphics();
    leatherArmor.fillStyle(0x8b4513);
    leatherArmor.fillRect(5, 4, 6, 8); // body
    leatherArmor.fillRect(4, 6, 2, 3); // left arm
    leatherArmor.fillRect(10, 6, 2, 3); // right arm
    leatherArmor.fillStyle(0xa0522d);
    leatherArmor.fillRect(6, 5, 4, 6); // chest
    leatherArmor.fillStyle(0x654321);
    leatherArmor.fillRect(7, 7, 2, 2); // center detail
    leatherArmor.generateTexture('item_leather_armor', size, size);
    leatherArmor.destroy();

    // Fish - gray/blue fish
    const fish = this.add.graphics();
    fish.fillStyle(0x4682b4);
    fish.fillRect(4, 7, 8, 3); // body
    fish.fillRect(2, 8, 2, 1); // head
    fish.fillStyle(0x87ceeb);
    fish.fillRect(5, 8, 6, 1); // highlight
    fish.fillRect(10, 6, 2, 1); // tail top
    fish.fillRect(10, 10, 2, 1); // tail bottom
    fish.fillStyle(0x000000);
    fish.fillRect(3, 8, 1, 1); // eye
    fish.generateTexture('item_fish', size, size);
    fish.destroy();

    // Logs - brown wood
    const logs = this.add.graphics();
    logs.fillStyle(0x8b4513);
    logs.fillRect(3, 6, 10, 4);
    logs.fillStyle(0xa0522d);
    logs.fillRect(4, 7, 8, 2);
    logs.fillStyle(0x654321);
    logs.fillRect(3, 7, 1, 2); // ring left
    logs.fillRect(12, 7, 1, 2); // ring right
    logs.fillRect(7, 7, 1, 2); // ring middle
    logs.generateTexture('item_logs', size, size);
    logs.destroy();

    // Silver ore - gray/silver rock
    const silverOre = this.add.graphics();
    silverOre.fillStyle(0x808080);
    silverOre.fillRect(4, 5, 8, 7);
    silverOre.fillStyle(0xc0c0c0);
    silverOre.fillRect(5, 6, 6, 5);
    silverOre.fillStyle(0xe8e8e8);
    silverOre.fillRect(6, 7, 4, 3);
    silverOre.fillStyle(0xa9a9a9);
    silverOre.fillRect(4, 11, 8, 1); // shadow
    silverOre.generateTexture('item_silver_ore', size, size);
    silverOre.destroy();

    // Ruby - red gem
    const ruby = this.add.graphics();
    ruby.fillStyle(0x8b0000);
    ruby.fillRect(7, 5, 4, 6);
    ruby.fillRect(6, 7, 6, 2);
    ruby.fillStyle(0xff0000);
    ruby.fillRect(8, 6, 2, 4);
    ruby.fillStyle(0xff6666);
    ruby.fillRect(8, 6, 1, 2); // highlight
    ruby.generateTexture('item_ruby', size, size);
    ruby.destroy();

    // Magic logs - glowing purple wood
    const magicLogs = this.add.graphics();
    magicLogs.fillStyle(0x4b0082);
    magicLogs.fillRect(3, 6, 10, 4);
    magicLogs.fillStyle(0x9370db);
    magicLogs.fillRect(4, 7, 8, 2);
    magicLogs.fillStyle(0xda70d6);
    magicLogs.fillRect(5, 7, 2, 2); // glow
    magicLogs.fillRect(9, 7, 2, 2); // glow
    magicLogs.generateTexture('item_magic_logs', size, size);
    magicLogs.destroy();

    // Diamond - cyan/blue gem
    const diamond = this.add.graphics();
    diamond.fillStyle(0x00bfff);
    diamond.fillRect(7, 4, 4, 8);
    diamond.fillRect(6, 6, 6, 4);
    diamond.fillStyle(0x87cefa);
    diamond.fillRect(8, 5, 2, 6);
    diamond.fillStyle(0xe0ffff);
    diamond.fillRect(8, 5, 1, 3); // highlight
    diamond.generateTexture('item_diamond', size, size);
    diamond.destroy();

    // Dragon scale - green/red scale
    const dragonScale = this.add.graphics();
    dragonScale.fillStyle(0x228b22);
    dragonScale.fillRect(5, 5, 6, 6);
    dragonScale.fillStyle(0x32cd32);
    dragonScale.fillRect(6, 6, 4, 4);
    dragonScale.fillStyle(0x8b0000);
    dragonScale.fillRect(7, 7, 2, 2); // red center
    dragonScale.fillStyle(0x006400);
    dragonScale.fillRect(5, 5, 2, 2); // dark edge
    dragonScale.fillRect(9, 9, 2, 2); // dark edge
    dragonScale.generateTexture('item_dragon_scale', size, size);
    dragonScale.destroy();

    // Enchanted amulet - purple/gold amulet
    const enchantedAmulet = this.add.graphics();
    enchantedAmulet.fillStyle(0xffd700);
    enchantedAmulet.fillCircle(8, 9, 3); // pendant
    enchantedAmulet.fillStyle(0x9370db);
    enchantedAmulet.fillCircle(8, 9, 2); // gem
    enchantedAmulet.fillStyle(0xffd700);
    enchantedAmulet.fillRect(6, 4, 1, 5); // chain left
    enchantedAmulet.fillRect(10, 4, 1, 5); // chain right
    enchantedAmulet.fillRect(7, 3, 3, 1); // chain top
    enchantedAmulet.generateTexture('item_enchanted_amulet', size, size);
    enchantedAmulet.destroy();

    // Partyhats (red, blue, green) - cone-shaped hats
    ['red', 'blue', 'green'].forEach((color) => {
      const partyhat = this.add.graphics();
      const colors = {
        red: { main: 0xff0000, light: 0xff6666, dark: 0x8b0000 },
        blue: { main: 0x0000ff, light: 0x6666ff, dark: 0x00008b },
        green: { main: 0x00ff00, light: 0x66ff66, dark: 0x006400 }
      };
      const col = colors[color];
      partyhat.fillStyle(col.dark);
      partyhat.fillRect(5, 10, 6, 2); // base
      partyhat.fillStyle(col.main);
      partyhat.fillTriangle(8, 3, 4, 12, 12, 12); // cone
      partyhat.fillStyle(col.light);
      partyhat.fillTriangle(8, 4, 6, 11, 10, 11); // highlight
      partyhat.generateTexture(`item_partyhat_${color}`, size, size);
      partyhat.destroy();
    });

    console.log('✅ Created pixel art item sprites');
  }
}
