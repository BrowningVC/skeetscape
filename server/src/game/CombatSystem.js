const SkillSystem = require('./SkillSystem');

class CombatSystem {
  // Attack a monster and return result
  static attack(player, monster) {
    // Calculate damage based on combat level
    const maxDamage = player.skills.combat.level * 2;
    const damage = Math.floor(Math.random() * maxDamage) + 1;

    // Apply damage to monster
    monster.health -= damage;
    const killed = monster.health <= 0;

    if (killed) {
      monster.health = 0;
    }

    // Award XP (5 XP per damage dealt)
    const xpGained = damage * 5;
    const levelUpResult = SkillSystem.addXP(player, 'combat', xpGained);

    // Roll for loot if monster killed
    let loot = null;
    if (killed) {
      loot = this.rollLoot(monster.id);
    }

    return {
      damage,
      xp: xpGained,
      loot,
      killed,
      monsterHealth: monster.health,
      levelUp: levelUpResult.leveledUp ? levelUpResult : null
    };
  }

  // Multi-tier loot drop table
  static rollLoot(monsterId) {
    const roll = Math.random() * 100;

    // Ultra Rare (0.1% chance) - Partyhats
    if (roll < 0.1) {
      const colors = ['red', 'blue', 'green'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      return {
        item_id: `partyhat_${color}`,
        quantity: 1,
        rarity: 'ultra_rare'
      };
    }

    // Very Rare (0.9% chance) - Valuable items
    if (roll < 1.0) {
      const items = [
        { item_id: 'diamond', quantity: 1 },
        { item_id: 'dragon_scale', quantity: 1 },
        { item_id: 'enchanted_amulet', quantity: 1 }
      ];
      const item = items[Math.floor(Math.random() * items.length)];
      return { ...item, rarity: 'very_rare' };
    }

    // Rare (9% chance) - Good items
    if (roll < 10.0) {
      const items = [
        { item_id: 'silver_ore', quantity: 1 },
        { item_id: 'ruby', quantity: 1 },
        { item_id: 'magic_logs', quantity: 1 },
        { item_id: 'coins', quantity: Math.floor(Math.random() * 51) + 50 } // 50-100 coins
      ];
      const item = items[Math.floor(Math.random() * items.length)];
      return { ...item, rarity: 'rare' };
    }

    // Uncommon (30% chance) - Useful items
    if (roll < 40.0) {
      const items = [
        { item_id: 'healing_potion', quantity: 1 },
        { item_id: 'bronze_sword', quantity: 1 },
        { item_id: 'leather_armor', quantity: 1 }
      ];
      const item = items[Math.floor(Math.random() * items.length)];
      return { ...item, rarity: 'uncommon' };
    }

    // Common (60% chance) - Basic items
    const items = [
      { item_id: 'bones', quantity: 1 },
      { item_id: 'raw_meat', quantity: 1 },
      { item_id: 'coins', quantity: Math.floor(Math.random() * 11) + 5 } // 5-15 coins
    ];
    const item = items[Math.floor(Math.random() * items.length)];
    return { ...item, rarity: 'common' };
  }

  // Respawn monster with full health
  static respawnMonster(monster) {
    monster.health = monster.maxHealth;
    monster.lastRespawn = Date.now();
    return monster;
  }
}

module.exports = CombatSystem;
