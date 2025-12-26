export default class GroundItem extends Phaser.GameObjects.Container {
  constructor(scene, groundItemData) {
    super(scene, groundItemData.x, groundItemData.y);

    this.groundItemId = groundItemData.id;
    this.itemId = groundItemData.itemId;
    this.quantity = groundItemData.quantity;

    // Create item background (a small circle)
    this.bg = scene.add.circle(0, 0, 12, 0xffaa00, 0.8);
    this.add(this.bg);

    // Create item text (shortened name)
    const displayName = this.getDisplayName(groundItemData.itemId);
    this.itemText = scene.add.text(0, 0, displayName, {
      font: 'bold 10px Arial',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    });
    this.itemText.setOrigin(0.5);
    this.add(this.itemText);

    // Show quantity if > 1
    if (this.quantity > 1) {
      this.quantityText = scene.add.text(10, -10, this.quantity, {
        font: 'bold 10px Arial',
        fill: '#ffff00',
        stroke: '#000000',
        strokeThickness: 2
      });
      this.quantityText.setOrigin(0.5);
      this.add(this.quantityText);
    }

    // Make interactive
    this.bg.setInteractive({ useHandCursor: true });
    this.bg.on('pointerdown', () => {
      this.pickup();
    });

    // Add to scene
    scene.add.existing(this);
    this.setDepth(4); // Above trees (3) but below monsters (5)

    // Pulsing animation
    scene.tweens.add({
      targets: this,
      scale: 1.1,
      duration: 500,
      yoyo: true,
      repeat: -1
    });
  }

  getDisplayName(itemId) {
    // Convert item_id to short display name
    const names = {
      bones: '🦴',
      raw_meat: '🥩',
      coins: '💰',
      healing_potion: '🧪',
      bronze_sword: '⚔️',
      leather_armor: '🛡️',
      fish: '🐟',
      logs: '🪵',
      silver_ore: '⛏️',
      ruby: '💎',
      magic_logs: '✨',
      diamond: '💎',
      dragon_scale: '🐉',
      enchanted_amulet: '📿',
      partyhat_red: '🎩',
      partyhat_blue: '🎩',
      partyhat_green: '🎩'
    };

    return names[itemId] || '?';
  }

  pickup() {
    this.scene.socketManager.emit('pickupGroundItem', { groundItemId: this.groundItemId });
  }

  update() {
    // Ground items don't need per-frame updates
  }
}
