import { COLORS } from '../utils/Constants.js';

export default class Monster extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, monsterData) {
    super(scene, monsterData.x, monsterData.y, 'monster');

    this.scene = scene;
    this.monsterId = monsterData.id;
    this.monsterHealth = monsterData.health;
    this.monsterMaxHealth = monsterData.maxHealth;

    // Add to scene
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Set up sprite
    this.setFrame(0); // Use first frame of goblin sprite
    this.setScale(1); // Ensure full size
    this.setDepth(5); // Ensure monsters render above ground
    this.setInteractive();
    this.setOrigin(0.5, 0.5);

    // Play idle animation to ensure visibility
    if (scene.anims.exists('monster_idle')) {
      this.play('monster_idle');
    }

    console.log('🐉 Monster created:', {
      id: this.monsterId,
      x: monsterData.x,
      y: monsterData.y,
      visible: this.visible,
      alpha: this.alpha,
      scale: this.scale,
      frame: this.frame.name,
      texture: this.texture.key
    });

    // Create health bar
    this.healthBarBg = scene.add.graphics();
    this.healthBar = scene.add.graphics();
    this.updateHealthBar();

    // Click handler for attacking
    this.on('pointerdown', () => {
      this.handleClick();
    });

    // Hover effects
    this.on('pointerover', () => {
      this.setTint(0xff9999);
    });

    this.on('pointerout', () => {
      this.clearTint();
    });
  }

  handleClick() {
    if (this.monsterHealth <= 0) {
      return; // Don't attack dead monsters
    }

    // Emit attack event
    const socketManager = this.scene.socketManager;
    socketManager.emit('attack', { monsterId: this.monsterId });
  }

  updateHealth(newHealth) {
    this.monsterHealth = newHealth;
    this.updateHealthBar();

    if (this.monsterHealth <= 0) {
      this.playDeathAnimation();
    }
  }

  updateHealthBar() {
    const barWidth = 32;
    const barHeight = 4;
    const x = this.x - barWidth / 2;
    const y = this.y - 24;

    this.healthBarBg.clear();
    this.healthBarBg.fillStyle(COLORS.HEALTH_BAR_BG, 0.5);
    this.healthBarBg.fillRect(x, y, barWidth, barHeight);

    this.healthBar.clear();
    const healthPercent = Math.max(0, this.monsterHealth / this.monsterMaxHealth);
    const fillColor = healthPercent > 0.3 ? COLORS.HEALTH_BAR_FILL : COLORS.HEALTH_BAR_LOW;
    this.healthBar.fillStyle(fillColor, 1);
    this.healthBar.fillRect(x, y, barWidth * healthPercent, barHeight);
  }

  showHitsplat(damage) {
    // Create damage text
    const hitsplat = this.scene.add.text(
      this.x + Phaser.Math.Between(-10, 10), // Random X offset
      this.y - 20,
      damage.toString(),
      {
        font: 'bold 16px Arial',
        fill: '#ff0000',
        stroke: '#000000',
        strokeThickness: 3
      }
    );
    hitsplat.setOrigin(0.5);
    hitsplat.setDepth(1000);

    // Animate hitsplat (float up and fade out)
    this.scene.tweens.add({
      targets: hitsplat,
      y: hitsplat.y - 40,
      alpha: 0,
      duration: 1000,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        hitsplat.destroy();
      }
    });
  }

  playDeathAnimation() {
    // Fade out and shrink
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scaleX: 0.5,
      scaleY: 0.5,
      duration: 500,
      onComplete: () => {
        this.setVisible(false);
      }
    });

    // Hide health bars
    this.healthBar.setVisible(false);
    this.healthBarBg.setVisible(false);
  }

  respawn(x, y, health, maxHealth) {
    this.x = x;
    this.y = y;
    this.monsterHealth = health;
    this.monsterMaxHealth = maxHealth;

    // Reset visuals
    this.setVisible(true);
    this.setAlpha(1);
    this.setScale(1);
    this.clearTint();

    // Show health bars
    this.healthBar.setVisible(true);
    this.healthBarBg.setVisible(true);

    this.updateHealthBar();
  }

  update() {
    // Update health bar position to follow monster
    if (this.healthBar && this.healthBarBg) {
      this.updateHealthBar();
    }
  }

  destroy() {
    if (this.healthBar) this.healthBar.destroy();
    if (this.healthBarBg) this.healthBarBg.destroy();
    super.destroy();
  }
}
