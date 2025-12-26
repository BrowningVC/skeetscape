# Pixel MMO Game

A multiplayer pixel-style MMO game inspired by Old School RuneScape, built with Phaser.js, Node.js, Socket.io, and SQLite.

## Features

- **Real-time Multiplayer**: Shared world where all players see each other
- **Account System**: Register and login with username/password
- **Three Trainable Skills**:
  - ⚔️ **Combat**: Fight monsters, gain XP, get rare loot
  - 🎣 **Fishing**: Catch fish at river spots to heal
  - 🪓 **Woodcutting**: Chop trees for logs to make fires
- **Multi-tier Loot System**:
  - Common (60%): Bones, Raw meat, Coins (5-15)
  - Uncommon (30%): Healing potion, Bronze sword, Leather armor
  - Rare (9%): Silver ore, Ruby, Magic logs, Coins (50-100)
  - Very Rare (0.9%): Diamond, Dragon scale, Enchanted amulet
  - Ultra Rare (0.1%): Partyhat (red/blue/green)
- **Hitsplats**: Floating damage numbers when attacking monsters
- **Persistent Progress**: All skills, inventory, and position saved

## Tech Stack

- **Frontend**: Phaser.js 3
- **Backend**: Node.js + Express + Socket.io
- **Database**: SQLite with better-sqlite3
- **Deployment**: Railway

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Git installed

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd pixel-mmo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env
   ```

4. **Edit `.env` and set your JWT secret**
   ```
   JWT_SECRET=your-random-secret-key-here
   ```

5. **Run the server**
   ```bash
   npm start
   ```

6. **Open your browser**
   ```
   http://localhost:3000
   ```

## Development

To run with auto-reload during development:

```bash
npm run dev
```

## Gameplay

### Controls
- **WASD** or **Arrow Keys**: Move your character
- **Click** on monsters: Attack
- **Click** on fishing spots: Fish
- **Click** on trees: Chop wood
- **I Key**: Toggle inventory
- **Click items** in inventory: Use/consume

### Skills
- **Combat**: Gain 5 XP per damage dealt. Higher levels = more damage
- **Fishing**: Gain 15 XP per successful catch. Fish heals 20 HP
- **Woodcutting**: Gain 20 XP per tree chopped. Use logs to place fires

### Fires
- Use logs from inventory to place fires near you
- Standing near fires heals 40 HP per second
- Fires last for 5 minutes before disappearing

## Deployment to Railway

1. **Create a Railway account** at [railway.app](https://railway.app)

2. **Create a new project** and connect your GitHub repository

3. **Add environment variables** in Railway dashboard:
   ```
   JWT_SECRET=your-random-secret-key
   NODE_ENV=production
   DB_PATH=/data/game.db
   ```

4. **Add a Volume** for database persistence:
   - Go to your service settings
   - Add a volume mounted at `/data`

5. **Deploy**: Railway will automatically deploy on every git push

## Project Structure

```
pixel-mmo/
├── client/                 # Frontend Phaser.js
│   ├── src/
│   │   ├── scenes/        # Game scenes
│   │   ├── entities/      # Game objects (Player, Monster, etc)
│   │   ├── network/       # Socket.io client
│   │   └── utils/         # Constants and helpers
│   ├── index.html
│   └── style.css
├── server/                # Backend Node.js
│   ├── src/
│   │   ├── game/         # Game systems (Combat, Skills, etc)
│   │   ├── database/     # SQLite setup and queries
│   │   ├── routes/       # Express routes
│   │   ├── socket/       # Socket.io handlers
│   │   └── index.js      # Main server file
│   └── data/             # SQLite database
├── package.json
└── railway.json
```

## Game Balance

- **Level Formula**: `level = floor(sqrt(xp / 100)) + 1`
- **Damage Formula**: Random between 1 and (Combat Level × 2)
- **Monster Health**: 50 HP
- **Monster Respawn**: 30 seconds
- **Tree/Fishing Spot Respawn**: 30 seconds
- **Player Starting HP**: 100
- **Fire Healing**: 40 HP per second (within 100 pixels)

## Future Features

- [ ] Chat system
- [ ] Trading between players
- [ ] Player vs Player combat
- [ ] Multiple monster types
- [ ] Equipment system (wear weapons/armor)
- [ ] Quests and NPCs
- [ ] Sound effects and music
- [ ] Custom pixel art assets

## License

MIT

## Credits

Built with ❤️ using Phaser.js, Node.js, and Socket.io
