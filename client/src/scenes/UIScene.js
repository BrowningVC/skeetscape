import { GAME_WIDTH, COLORS } from '../utils/Constants.js';
import socketManager from '../network/SocketManager.js';

export default class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene' });
    this.playerData = null;
    this.inventoryVisible = false;
    this.statsVisible = false;
  }

  create() {
    // Create UI elements immediately so they're always visible
    this.createUIElements();

    // Set up socket listener for player data
    socketManager.on('init', (data) => {
      this.playerData = data.player;
      // Update all UI elements with actual data
      this.updateHealthBar();
      this.updateSkillsPanel();
    });

    // Listen for updates
    socketManager.on('healthUpdate', (data) => {
      if (this.playerData) {
        this.playerData.health = data.health;
        this.updateHealthBar();
      }
    });

    socketManager.on('skillUpdate', (data) => {
      if (this.playerData && this.playerData.skills[data.skill]) {
        this.playerData.skills[data.skill].level = data.level;
        this.playerData.skills[data.skill].xp = data.xp;
        this.updateSkillsPanel();
      }
    });

    socketManager.on('inventoryUpdate', (data) => {
      if (this.playerData) {
        this.playerData.inventory = data.inventory;
        if (this.inventoryVisible) {
          this.renderInventory();
        }
      }
    });

    // Toggle inventory with 'I' key
    this.input.keyboard.on('keydown-I', () => {
      this.toggleInventory();
    });

    // Toggle stats with Tab key
    this.input.keyboard.on('keydown-TAB', () => {
      this.toggleStats();
    });
  }

  createUIElements() {
    // Health bar
    const hpX = 10;
    const hpY = 10;
    const hpWidth = 200;
    const hpHeight = 20;

    this.healthBarBg = this.add.graphics();
    this.healthBarBg.setDepth(1000); // UI elements always on top
    this.healthBarBg.fillStyle(COLORS.HEALTH_BAR_BG, 0.8);
    this.healthBarBg.fillRect(hpX, hpY, hpWidth, hpHeight);

    this.healthBar = this.add.graphics();
    this.healthBar.setDepth(1000); // UI elements always on top

    this.healthText = this.add.text(hpX + hpWidth / 2, hpY + hpHeight / 2, 'Loading...', {
      font: '12px Arial',
      fill: '#ffffff'
    });
    this.healthText.setOrigin(0.5);

    // Skills panel
    this.createSkillsPanel();
  }

  updateHealthBar() {
    if (!this.playerData || !this.healthBar) return;

    const hpX = 10;
    const hpY = 10;
    const hpWidth = 200;
    const hpHeight = 20;

    this.healthBar.clear();
    const healthPercent = this.playerData.health / this.playerData.maxHealth;
    const fillColor = healthPercent > 0.3 ? COLORS.HEALTH_BAR_FILL : COLORS.HEALTH_BAR_LOW;
    this.healthBar.fillStyle(fillColor, 1);
    this.healthBar.fillRect(hpX, hpY, hpWidth * healthPercent, hpHeight);

    this.healthText.setText(`HP: ${this.playerData.health}/${this.playerData.maxHealth}`);
  }

  createSkillsPanel() {
    const startX = 10;
    const startY = 40;
    const skillHeight = 40;

    const skills = ['combat', 'fishing', 'woodcutting'];
    const skillLabels = {
      combat: '⚔️ Combat',
      fishing: '🎣 Fishing',
      woodcutting: '🪓 Woodcutting'
    };

    this.skillTexts = {};

    skills.forEach((skill, index) => {
      const y = startY + (index * skillHeight);

      // Skill label
      const label = this.add.text(startX, y, skillLabels[skill], {
        font: 'bold 14px Arial',
        fill: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2
      });

      // Level text - show placeholder initially
      this.skillTexts[skill] = this.add.text(startX, y + 18, 'Loading...', {
        font: '12px Arial',
        fill: '#ffff00',
        stroke: '#000000',
        strokeThickness: 2
      });
    });

    // Create HUD buttons (always visible)
    this.createHUDButtons();
  }

  createHUDButtons() {
    const buttonY = 10;
    const buttonSpacing = 140;

    // Stats button
    this.statsButton = this.add.text(GAME_WIDTH - 250, buttonY, '📊 Stats (Tab)', {
      font: 'bold 14px Arial',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
      backgroundColor: '#00000088',
      padding: { x: 8, y: 4 }
    });
    this.statsButton.setInteractive();
    this.statsButton.on('pointerdown', () => {
      this.toggleStats();
    });
    this.statsButton.on('pointerover', () => {
      this.statsButton.setBackgroundColor('#667eea88');
    });
    this.statsButton.on('pointerout', () => {
      this.statsButton.setBackgroundColor('#00000088');
    });

    // Inventory button
    this.inventoryButton = this.add.text(GAME_WIDTH - 120, buttonY, '🎒 Inventory (I)', {
      font: 'bold 14px Arial',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
      backgroundColor: '#00000088',
      padding: { x: 8, y: 4 }
    });
    this.inventoryButton.setInteractive();
    this.inventoryButton.on('pointerdown', () => {
      this.toggleInventory();
    });
    this.inventoryButton.on('pointerover', () => {
      this.inventoryButton.setBackgroundColor('#667eea88');
    });
    this.inventoryButton.on('pointerout', () => {
      this.inventoryButton.setBackgroundColor('#00000088');
    });
  }

  updateSkillsPanel() {
    if (!this.playerData || !this.skillTexts) return;

    ['combat', 'fishing', 'woodcutting'].forEach((skill) => {
      const skillData = this.playerData.skills[skill];
      if (skillData) {
        this.skillTexts[skill].setText(`Lvl ${skillData.level} | XP: ${skillData.xp}`);
      }
    });
  }

  toggleInventory() {
    this.inventoryVisible = !this.inventoryVisible;

    if (this.inventoryVisible) {
      this.showInventory();
    } else {
      this.hideInventory();
    }
  }

  showInventory() {
    // Create inventory panel
    const panelX = GAME_WIDTH / 2 - 200;
    const panelY = 80;
    const panelWidth = 400;
    const panelHeight = 400;

    this.inventoryPanel = this.add.graphics();
    this.inventoryPanel.setDepth(1001); // Above all other UI elements
    this.inventoryPanel.fillStyle(0x333333, 0.95);
    this.inventoryPanel.fillRect(panelX, panelY, panelWidth, panelHeight);
    this.inventoryPanel.lineStyle(2, 0x667eea);
    this.inventoryPanel.strokeRect(panelX, panelY, panelWidth, panelHeight);

    this.inventoryTitle = this.add.text(GAME_WIDTH / 2, panelY + 20, 'INVENTORY', {
      font: 'bold 20px Arial',
      fill: '#ffffff'
    });
    this.inventoryTitle.setOrigin(0.5);

    this.inventoryItems = [];
    this.renderInventory();
  }

  renderInventory() {
    // Clear previous items
    this.inventoryItems.forEach(item => item.destroy());
    this.inventoryItems = [];

    if (!this.playerData || !this.playerData.inventory) return;

    const panelX = GAME_WIDTH / 2 - 200;
    const panelY = 80;
    const startX = panelX + 20;
    const startY = panelY + 60;
    const slotSize = 50;
    const cols = 7;

    // Render each inventory item
    this.playerData.inventory.forEach((item) => {
      const col = item.slot % cols;
      const row = Math.floor(item.slot / cols);
      const x = startX + (col * slotSize);
      const y = startY + (row * slotSize);

      // Slot background
      const slotBg = this.add.graphics();
      slotBg.setDepth(1002); // Above inventory panel
      slotBg.fillStyle(0x555555, 1);
      slotBg.fillRect(x, y, slotSize - 4, slotSize - 4);
      slotBg.lineStyle(1, 0x888888);
      slotBg.strokeRect(x, y, slotSize - 4, slotSize - 4);
      this.inventoryItems.push(slotBg);

      // Item name
      const itemText = this.add.text(x + 2, y + 2, item.item_id.replace(/_/g, ' '), {
        font: '8px Arial',
        fill: '#ffffff',
        wordWrap: { width: slotSize - 8 }
      });
      this.inventoryItems.push(itemText);

      // Quantity
      if (item.quantity > 1) {
        const qtyText = this.add.text(x + slotSize - 6, y + slotSize - 6, item.quantity, {
          font: 'bold 10px Arial',
          fill: '#ffff00'
        });
        qtyText.setOrigin(1, 1);
        this.inventoryItems.push(qtyText);
      }

      // Make interactive
      slotBg.setInteractive(new Phaser.Geom.Rectangle(x, y, slotSize - 4, slotSize - 4), Phaser.Geom.Rectangle.Contains);
      slotBg.on('pointerdown', () => {
        this.useItem(item.item_id, item.slot);
      });
    });

    // Instructions
    const instructions = this.add.text(GAME_WIDTH / 2, panelY + 380, 'Click item to use | Press I to close', {
      font: '12px Arial',
      fill: '#aaaaaa'
    });
    instructions.setOrigin(0.5);
    this.inventoryItems.push(instructions);
  }

  useItem(itemId, slot) {
    socketManager.emit('useItem', { itemId, slot });
  }

  hideInventory() {
    if (this.inventoryPanel) this.inventoryPanel.destroy();
    if (this.inventoryTitle) this.inventoryTitle.destroy();
    this.inventoryItems.forEach(item => item.destroy());
    this.inventoryItems = [];
  }

  toggleStats() {
    this.statsVisible = !this.statsVisible;

    if (this.statsVisible) {
      this.showStats();
    } else {
      this.hideStats();
    }
  }

  showStats() {
    // Create stats panel
    const panelX = GAME_WIDTH / 2 - 200;
    const panelY = 80;
    const panelWidth = 400;
    const panelHeight = 350;

    this.statsPanel = this.add.graphics();
    this.statsPanel.setDepth(1001); // Above all other UI elements
    this.statsPanel.fillStyle(0x333333, 0.95);
    this.statsPanel.fillRect(panelX, panelY, panelWidth, panelHeight);
    this.statsPanel.lineStyle(2, 0x667eea);
    this.statsPanel.strokeRect(panelX, panelY, panelWidth, panelHeight);

    this.statsTitle = this.add.text(GAME_WIDTH / 2, panelY + 20, 'PLAYER STATS', {
      font: 'bold 20px Arial',
      fill: '#ffffff'
    });
    this.statsTitle.setOrigin(0.5);

    this.statsElements = [];
    this.renderStats();
  }

  renderStats() {
    if (!this.playerData) return;

    const panelX = GAME_WIDTH / 2 - 200;
    const panelY = 80;
    const startX = panelX + 30;
    const startY = panelY + 60;
    const lineHeight = 30;

    // Player info
    const username = this.add.text(startX, startY, `Username: ${this.playerData.username}`, {
      font: 'bold 16px Arial',
      fill: '#ffffff'
    });
    this.statsElements.push(username);

    const userId = this.add.text(startX, startY + lineHeight, `User ID: ${this.playerData.userId}`, {
      font: '14px Arial',
      fill: '#aaaaaa'
    });
    this.statsElements.push(userId);

    // Health
    const healthTitle = this.add.text(startX, startY + lineHeight * 2.5, 'Combat Stats', {
      font: 'bold 16px Arial',
      fill: '#ff6b6b'
    });
    this.statsElements.push(healthTitle);

    const health = this.add.text(startX + 20, startY + lineHeight * 3.5, `Health: ${this.playerData.health}/${this.playerData.maxHealth}`, {
      font: '14px Arial',
      fill: '#ffffff'
    });
    this.statsElements.push(health);

    // Skills
    const skillsTitle = this.add.text(startX, startY + lineHeight * 5, 'Skills', {
      font: 'bold 16px Arial',
      fill: '#667eea'
    });
    this.statsElements.push(skillsTitle);

    const skillLabels = {
      combat: '⚔️ Combat',
      fishing: '🎣 Fishing',
      woodcutting: '🪓 Woodcutting'
    };

    let skillIndex = 0;
    ['combat', 'fishing', 'woodcutting'].forEach((skill) => {
      const skillData = this.playerData.skills[skill];
      if (skillData) {
        const skillText = this.add.text(
          startX + 20,
          startY + lineHeight * (6 + skillIndex),
          `${skillLabels[skill]}: Level ${skillData.level} (${skillData.xp} XP)`,
          {
            font: '14px Arial',
            fill: '#ffffff'
          }
        );
        this.statsElements.push(skillText);
        skillIndex++;
      }
    });

    // Instructions
    const instructions = this.add.text(GAME_WIDTH / 2, panelY + 320, 'Press S to close', {
      font: '12px Arial',
      fill: '#aaaaaa'
    });
    instructions.setOrigin(0.5);
    this.statsElements.push(instructions);
  }

  hideStats() {
    if (this.statsPanel) this.statsPanel.destroy();
    if (this.statsTitle) this.statsTitle.destroy();
    if (this.statsElements) {
      this.statsElements.forEach(element => element.destroy());
      this.statsElements = [];
    }
  }
}
