export default class GroundItem extends Phaser.GameObjects.Container {
  constructor(scene, groundItemData) {
    super(scene, groundItemData.x, groundItemData.y);

    this.groundItemId = groundItemData.id;
    this.itemId = groundItemData.itemId;
    this.quantity = groundItemData.quantity;
    this.rarity = this.getItemRarity(groundItemData.itemId);

    // Get colors based on rarity
    const colors = this.getRarityColors(this.rarity);

    // Create item background with rarity-based color
    this.bg = scene.add.circle(0, 0, 16, colors.bg, 0.9);
    this.add(this.bg);

    // Add border glow for rare items
    if (this.rarity !== 'common') {
      this.glow = scene.add.circle(0, 0, 18, colors.glow, 0.4);
      this.add(this.glow);
      this.sendToBack(this.glow);
    }

    // Create item icon/text
    const displayIcon = this.getDisplayIcon(groundItemData.itemId);
    this.itemText = scene.add.text(0, 0, displayIcon, {
      font: 'bold 16px Arial',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    });
    this.itemText.setOrigin(0.5);
    this.add(this.itemText);

    // Show quantity if > 1
    if (this.quantity > 1) {
      this.quantityBg = scene.add.circle(12, 12, 8, 0x000000, 0.8);
      this.add(this.quantityBg);

      this.quantityText = scene.add.text(12, 12, this.quantity, {
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

    // Hover effect
    this.bg.on('pointerover', () => {
      this.bg.setFillStyle(colors.hover, 1);
      scene.tweens.killTweensOf(this);
      this.setScale(1.3);
    });

    this.bg.on('pointerout', () => {
      this.bg.setFillStyle(colors.bg, 0.9);
      this.setScale(1);
      this.startPulseAnimation(scene);
    });

    // Add to scene
    scene.add.existing(this);
    this.setDepth(4); // Above trees (3) but below monsters (5)

    // Start pulsing animation
    this.startPulseAnimation(scene);
  }

  startPulseAnimation(scene) {
    // Pulsing animation based on rarity
    if (this.rarity === 'ultra_rare' || this.rarity === 'very_rare') {
      scene.tweens.add({
        targets: this,
        scale: 1.15,
        duration: 400,
        yoyo: true,
        repeat: -1
      });
    } else if (this.rarity === 'rare') {
      scene.tweens.add({
        targets: this,
        scale: 1.1,
        duration: 600,
        yoyo: true,
        repeat: -1
      });
    } else {
      scene.tweens.add({
        targets: this,
        scale: 1.05,
        duration: 800,
        yoyo: true,
        repeat: -1
      });
    }
  }

  getDisplayIcon(itemId) {
    // Convert item_id to display icon (emoji)
    const icons = {
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

    return icons[itemId] || '?';
  }

  getItemRarity(itemId) {
    // Map items to their rarity
    const rarityMap = {
      // Ultra rare
      partyhat_red: 'ultra_rare',
      partyhat_blue: 'ultra_rare',
      partyhat_green: 'ultra_rare',
      // Very rare
      diamond: 'very_rare',
      dragon_scale: 'very_rare',
      enchanted_amulet: 'very_rare',
      // Rare
      silver_ore: 'rare',
      ruby: 'rare',
      magic_logs: 'rare',
      // Uncommon
      healing_potion: 'uncommon',
      bronze_sword: 'uncommon',
      leather_armor: 'uncommon',
      // Common
      bones: 'common',
      raw_meat: 'common',
      fish: 'common',
      logs: 'common',
      coins: 'common'
    };

    return rarityMap[itemId] || 'common';
  }

  getRarityColors(rarity) {
    // Return colors based on rarity
    const colorMap = {
      ultra_rare: {
        bg: 0xff00ff,      // Magenta
        glow: 0xff88ff,    // Light magenta
        hover: 0xff66ff    // Bright magenta
      },
      very_rare: {
        bg: 0x00ffff,      // Cyan
        glow: 0x88ffff,    // Light cyan
        hover: 0x66ffff    // Bright cyan
      },
      rare: {
        bg: 0xffd700,      // Gold
        glow: 0xffed4e,    // Light gold
        hover: 0xffe44d    // Bright gold
      },
      uncommon: {
        bg: 0x4caf50,      // Green
        glow: 0x81c784,    // Light green
        hover: 0x66bb6a    // Bright green
      },
      common: {
        bg: 0x9e9e9e,      // Gray
        glow: 0xbdbdbd,    // Light gray
        hover: 0xb0b0b0    // Bright gray
      }
    };

    return colorMap[rarity] || colorMap.common;
  }

  pickup() {
    this.scene.socketManager.emit('pickupGroundItem', { groundItemId: this.groundItemId });
  }

  update() {
    // Ground items don't need per-frame updates
  }
}
