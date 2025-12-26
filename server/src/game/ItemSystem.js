// Item definitions and usage logic
const ITEM_DEFINITIONS = {
  // Consumables - Healing
  fish: { type: 'consumable', healAmount: 20, stackable: true },
  raw_meat: { type: 'consumable', healAmount: 10, stackable: true },
  healing_potion: { type: 'consumable', healAmount: 50, stackable: true },

  // Resources
  logs: { type: 'resource', stackable: true },
  bones: { type: 'resource', stackable: true },
  silver_ore: { type: 'resource', stackable: true },
  magic_logs: { type: 'resource', stackable: true },

  // Currency
  coins: { type: 'currency', stackable: true },

  // Equipment - Weapons
  bronze_sword: { type: 'equipment', slot: 'weapon', stackable: false },

  // Equipment - Armor
  leather_armor: { type: 'equipment', slot: 'armor', stackable: false },

  // Jewelry
  ruby: { type: 'jewelry', stackable: false },
  diamond: { type: 'jewelry', stackable: false },
  enchanted_amulet: { type: 'jewelry', stackable: false },
  dragon_scale: { type: 'jewelry', stackable: false },

  // Rare items - Partyhats (each color is separate)
  partyhat_red: { type: 'rare', stackable: false },
  partyhat_blue: { type: 'rare', stackable: false },
  partyhat_green: { type: 'rare', stackable: false }
};

class ItemSystem {
  // Use an item from inventory
  static useItem(player, itemId, slot) {
    const itemDef = ITEM_DEFINITIONS[itemId];

    if (!itemDef) {
      return { success: false, error: 'Invalid item' };
    }

    // Handle consumables
    if (itemDef.type === 'consumable') {
      // Heal player
      const oldHealth = player.health;
      player.health = Math.min(player.health + itemDef.healAmount, player.maxHealth);
      const actualHealing = player.health - oldHealth;

      // Remove item from inventory
      this.removeFromInventory(player, slot, 1);

      return {
        success: true,
        action: 'heal',
        amount: actualHealing,
        newHealth: player.health
      };
    }

    // Logs can be used to place fire
    if (itemId === 'logs') {
      return {
        success: true,
        action: 'place_fire',
        requiresPosition: true
      };
    }

    return { success: false, error: 'Item cannot be used' };
  }

  // Add item to inventory
  static addToInventory(player, item) {
    const itemDef = ITEM_DEFINITIONS[item.item_id];

    if (!itemDef) {
      console.error(`Unknown item: ${item.item_id}`);
      return false;
    }

    // Check if stackable and already in inventory
    if (itemDef.stackable) {
      const existing = player.inventory.find(i => i.item_id === item.item_id);
      if (existing) {
        existing.quantity += item.quantity;
        return true;
      }
    }

    // Find empty slot
    const maxSlots = 28;
    let emptySlot = -1;

    for (let i = 0; i < maxSlots; i++) {
      const slotUsed = player.inventory.some(item => item.slot === i);
      if (!slotUsed) {
        emptySlot = i;
        break;
      }
    }

    if (emptySlot === -1) {
      return false; // Inventory full
    }

    // Add item to inventory
    player.inventory.push({
      item_id: item.item_id,
      quantity: item.quantity,
      slot: emptySlot
    });

    return true;
  }

  // Remove item from inventory
  static removeFromInventory(player, slot, quantity = 1) {
    const itemIndex = player.inventory.findIndex(item => item.slot === slot);

    if (itemIndex === -1) {
      return false;
    }

    const item = player.inventory[itemIndex];

    if (item.quantity <= quantity) {
      // Remove entire stack
      player.inventory.splice(itemIndex, 1);
    } else {
      // Decrease quantity
      item.quantity -= quantity;
    }

    return true;
  }

  // Drop item from inventory
  static dropItem(player, slot) {
    const itemIndex = player.inventory.findIndex(item => item.slot === slot);

    if (itemIndex === -1) {
      return null;
    }

    const item = player.inventory[itemIndex];
    player.inventory.splice(itemIndex, 1);

    return {
      item_id: item.item_id,
      quantity: item.quantity,
      x: player.x,
      y: player.y
    };
  }

  // Check if inventory has space
  static hasInventorySpace(player) {
    return player.inventory.length < 28;
  }
}

module.exports = ItemSystem;
