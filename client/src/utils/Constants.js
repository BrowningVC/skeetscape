// Game configuration constants
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;

// Movement
export const PLAYER_SPEED = 150;

// Skills
export const SKILLS = {
  COMBAT: 'combat',
  FISHING: 'fishing',
  WOODCUTTING: 'woodcutting'
};

// Item IDs
export const ITEMS = {
  // Resources
  FISH: 'fish',
  LOGS: 'logs',
  BONES: 'bones',
  RAW_MEAT: 'raw_meat',
  SILVER_ORE: 'silver_ore',
  MAGIC_LOGS: 'magic_logs',

  // Consumables
  HEALING_POTION: 'healing_potion',

  // Equipment
  BRONZE_SWORD: 'bronze_sword',
  LEATHER_ARMOR: 'leather_armor',

  // Jewelry
  RUBY: 'ruby',
  DIAMOND: 'diamond',
  ENCHANTED_AMULET: 'enchanted_amulet',
  DRAGON_SCALE: 'dragon_scale',

  // Rare
  PARTYHAT_RED: 'partyhat_red',
  PARTYHAT_BLUE: 'partyhat_blue',
  PARTYHAT_GREEN: 'partyhat_green',

  // Currency
  COINS: 'coins'
};

// Colors
export const COLORS = {
  PRIMARY: 0x667eea,
  HEALTH_BAR_BG: 0x000000,
  HEALTH_BAR_FILL: 0x00ff00,
  HEALTH_BAR_LOW: 0xff0000,
  XP_BAR_BG: 0x222222,
  XP_BAR_FILL: 0x4CAF50,
  DAMAGE_TEXT: 0xff0000
};

// Server URL
export const SERVER_URL = window.location.origin;

export default {
  GAME_WIDTH,
  GAME_HEIGHT,
  PLAYER_SPEED,
  SKILLS,
  ITEMS,
  COLORS,
  SERVER_URL
};
