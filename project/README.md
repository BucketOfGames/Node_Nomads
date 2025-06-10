# NodeNomads - Perpetual Graph-Strategy Idle MMO

A browser-first strategy game where players claim nodes on an infinite graph, battle for territory, and earn charge over time. Built with React, Three.js, and Supabase.

## 🎮 Features

- **Infinite Graph Strategy**: Claim nodes and draw edges on an ever-expanding graph
- **Real-time Multiplayer**: Live synchronization with other players worldwide
- **Idle Progression**: Earn charge from your nodes even while offline
- **Faction Warfare**: Join Red or Blue faction and compete for weekly dominance
- **Mobile-First**: Optimized for both desktop and mobile play
- **No Resets**: Persistent world that never ends

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- Supabase account
- Stripe account (for monetization features)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd nodenomads-idle-mmo
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Fill in your Supabase and Stripe credentials in `.env`.

4. Set up Supabase:
   - Create a new Supabase project
   - Run the migration file in `supabase/migrations/create_game_schema.sql`
   - Deploy the edge function in `supabase/functions/offline-income/`

5. Start the development server:
```bash
npm run dev
```

## 🎯 Gameplay

### Core Mechanics

- **Node Capture**: Click neutral (gray) nodes to capture them for 10 charge
- **Fortification**: Click owned nodes to upgrade their defenses
- **Raiding**: Click rival faction edges to destroy connections
- **Idle Income**: +1 charge per node per minute, even when offline

### Factions

- **Red Faction**: Aggressive expansion strategy
- **Blue Faction**: Defensive fortification focus
- **Weekly Competition**: Scores reset every Monday at 00:00 UTC

## 🛠 Technical Architecture

### Frontend
- **React 18** with TypeScript
- **Three.js** for 3D graph visualization
- **Tailwind CSS** for styling
- **Zustand** for state management
- **React Router** for navigation

### Backend
- **Supabase** for database and real-time sync
- **PostgreSQL** for persistent data
- **Edge Functions** for CRON jobs and server logic
- **Row Level Security** for data protection

### Database Schema

- `players`: User profiles and faction membership
- `nodes`: Graph nodes with ownership and fortification
- `edges`: Connections between nodes
- `faction_scores`: Weekly competition tracking

## 🎨 Design Philosophy

- **Mobile-First**: Touch-optimized controls and responsive layout
- **Cyberpunk Aesthetic**: Neon colors and dark backgrounds
- **Smooth Animations**: Fluid transitions and particle effects
- **Apple-Level Polish**: Attention to detail in every interaction

## 🔧 Development

### Code Organization

- `src/components/`: Reusable UI components
- `src/pages/`: Route-level components
- `src/stores/`: Zustand state management
- `src/types/`: TypeScript type definitions
- `src/lib/`: Utility functions and API clients

### Key Components

- `GameScene`: Three.js canvas with node/edge rendering
- `GameHUD`: Player stats and faction information
- `Tutorial`: 30-second onboarding experience
- `LoginForm`: Faction selection and anonymous auth

## 🎮 Monetization

### Implemented
- **Stripe Integration**: Ready for cosmetic purchases
- **Google Ads Hooks**: Placeholder for rewarded videos and interstitials

### Planned
- Cosmetic node skins
- Branded sponsored nodes
- Alliance invite system with revenue sharing

## 📱 Deployment

### Build for Production
```bash
npm run build
```

### Environment Variables
See `.env.example` for required configuration:
- Supabase URL and keys
- Stripe publishable key
- Google Ads publisher ID

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🎯 Roadmap

- [ ] Alliance system with invite links
- [ ] TikTok/ironSource playable ads
- [ ] A/B testing framework
- [ ] Advanced node abilities
- [ ] Tournament modes
- [ ] Mobile app versions

---

Built with ❤️ for the browser-first gaming future.