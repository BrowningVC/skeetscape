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

    // Load placeholder assets (will be replaced with actual pixel art)
    // For now, we'll create simple colored rectangles as placeholders
    this.createPlaceholderAssets();
  }

  create() {
    console.log('✅ Boot scene complete');
    this.scene.start('LoginScene');
  }

  createPlaceholderAssets() {
    // Create placeholder graphics - simple pixel-art style
    // These will be replaced with actual sprite sheets later

    // Player placeholder - blue character with face
    const playerGraphics = this.add.graphics();
    // Body
    playerGraphics.fillStyle(0x3498db);
    playerGraphics.fillRect(8, 12, 16, 16);
    // Head
    playerGraphics.fillStyle(0xffd699);
    playerGraphics.fillRect(10, 6, 12, 10);
    // Eyes
    playerGraphics.fillStyle(0x000000);
    playerGraphics.fillRect(12, 10, 2, 2);
    playerGraphics.fillRect(18, 10, 2, 2);
    // Legs
    playerGraphics.fillStyle(0x2c3e50);
    playerGraphics.fillRect(10, 28, 5, 4);
    playerGraphics.fillRect(17, 28, 5, 4);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

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
