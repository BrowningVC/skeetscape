class SkillSystem {
  // Add XP to a skill and check for level ups
  static addXP(playerData, skill, amount) {
    if (!playerData.skills[skill]) {
      console.error(`Invalid skill: ${skill}`);
      return { leveledUp: false };
    }

    playerData.skills[skill].xp += amount;

    const newLevel = this.calculateLevel(playerData.skills[skill].xp);
    const oldLevel = playerData.skills[skill].level;

    if (newLevel > oldLevel) {
      playerData.skills[skill].level = newLevel;
      return {
        leveledUp: true,
        oldLevel,
        newLevel,
        skill
      };
    }

    return { leveledUp: false };
  }

  // Calculate level from XP using formula: level = floor(sqrt(xp / 100)) + 1
  static calculateLevel(xp) {
    return Math.floor(Math.sqrt(xp / 100)) + 1;
  }

  // Check if player meets level requirement
  static canPerformAction(playerData, skill, requiredLevel) {
    return playerData.skills[skill] && playerData.skills[skill].level >= requiredLevel;
  }

  // Get XP needed for next level
  static getXPForNextLevel(currentLevel) {
    const nextLevel = currentLevel + 1;
    return (nextLevel - 1) * (nextLevel - 1) * 100;
  }
}

module.exports = SkillSystem;
