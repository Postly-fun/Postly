# <div align="center"><img src="public/logo.png" width="80" height="80" alt="Postly Logo"><br>Postly</div>

<div align="center">
  <h3>Post. Boost. Earn. The Social Network with Real Stakes.</h3>
  <p>Built on <b>Solana</b> • Powered by <b>USDC</b> • Designed for <b>DeFi Degens</b></p>
</div>

---

## 🌟 Vision

**Postly** is not just another social network; it's a high-stakes arena where every word has a price and every interaction generates value. Inspired by the intensity of DeFi and the reach of social media, Postly introduces game-theoretical mechanics to content creation.

In Postly, you don't just "post"—you **invest**. Every post costs USDC. Every reply earns you money. Every post can be **stolen** by anyone willing to pay double its current value.

## 🚀 Key Features

### 💎 The 'Steal' Mechanic
Ever seen a post so good you wanted to own it? On Postly, you can. By paying **double** the current locked value of a post, you become its new owner. You take control of its revenue stream, earning USDC from every future reply and subsequent steal.

### ⚡ Exponential Boosting
Visibility is a commodity. Boosting a post doubles its current boost price, ensuring that the top of the feed is always occupied by the most valuable (or most daring) content.

### 💸 Reply-to-Earn
Quality interactions are rewarded. When someone replies to your post, a portion of their fee is sent directly to your wallet. High-engagement threads become passive income engines for creators.

### 🔥 Real-time Emoji Reactions
Express yourself with interactive, real-time emoji reactions. Whether it's a 💎 or a 🚀, let the community know what's hot without spending a dime.

### 🏆 Global Leaderboard
Track the top earners in the community. Our real-time leaderboard ranks users by their total USDCs earned, fostering a competitive and transparent creator economy.

### 🔐 Secure Wallet Management
Postly features a built-in, non-custodial styled wallet management system. Users can securely export their **private keys** at any time to import their funds into external wallets like Phantom or Solflare.

## 🛠 Tech Stack

- **Frontend**: [Next.js 14 (App Router)](https://nextjs.org/) with [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/) for fluid, premium interactions
- **Database**: [PostgreSQL](https://www.postgresql.org/) managed via [Prisma ORM](https://www.prisma.io/)
- **Web3**: [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/) & [SPL Token](https://spl.solana.com/token) (USDC)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) for efficient, real-time UI updates
- **Icons**: [Lucide React](https://lucide.dev/)

## ⚙️ Setup & Installation

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Solana RPC (e.g., Helius, QuickNode)

### Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/postly.git
   cd postly
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/postly"
   WALLET_ENCRYPTION_KEY="your-64-character-hex-key"
   JWT_SECRET="your-secure-jwt-secret"
   SOLANA_RPC_URL="your-solana-rpc-url"
   ```

4. **Initialize Database**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

5. **Run Development Server**
   ```bash
   npm run dev
   ```

## 🌐 Deployment (Vercel)

Postly is optimized for Vercel. Ensure you add your environment variables in the Vercel dashboard. The project includes a custom build script to handle migrations automatically:

```json
"build": "prisma generate && prisma migrate deploy && next build"
```

---

<div align="center">
  <p><a href="https://postly.fun">Launch App</a></p>
</div>
