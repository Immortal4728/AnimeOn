# 🌌 Anime On — Retro Personal Media Shelf

> **Save what catches your attention. Come back whenever you're ready.**

Anime On is a minimalist, retro-futuristic personal media shelf designed for keeping track of your favorite anime, movies, K-dramas, web series, books, games, and links — without social noise, rating wars, or algorithmic feeds.

---

## ✨ Highlights & Features

- 🎌 **Unified Media Vault**: Seamlessly track **Anime**, **Movies**, **K-Dramas**, **Web Series**, **Books**, **Games**, and **Links** under a unified dashboard.
- 🎨 **Dynamic Cyberpunk Aesthetics**: Custom theme engine supporting vibrant neon color palettes (*Neon Pink*, *Cyber Purple*, *Electric Blue*, *Crimson*, *Matrix Green*, etc.) persisted across devices.
- 📚 **Category-Tailored Card Systems**:
  - **Books**: Cover-first design with signature author reveal.
  - **Movies / K-Dramas / Web Series**: Modern cinematic typography with sleek outside-the-card hover details.
  - **Games & Anime**: Full-bleed retro poster viewports.
- ⚡ **Instant Filtering & Search**: Real-time title search and status toggles (*Watching*, *Completed*, *Plan to Watch*).
- 📱 **Mobile-First 2-Column Grid**: Fully responsive 2-column layout on mobile viewports (320px–430px) that scales seamlessly up to a 6-column dashboard on desktop.
- 🔒 **Private & Isolated**: User data is isolated per authenticated account via cloud persistence.
- 🛡️ **Admin Analytics**: Dedicated admin gateway for platform metrics and system monitoring.

---

## 🛠️ Tech Stack

- **Frontend Framework**: [React 18](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Routing**: [TanStack Router](https://tanstack.com/router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/), [Lucide React Icons](https://lucide.dev/)
- **Backend & Authentication**: [Firebase Auth & Cloud Firestore](https://firebase.google.com/), [Supabase](https://supabase.com/)
- **UI Notifications**: [Sonner](https://sonner.emilkowal.si/)

---

## 🚀 Getting Started Locally

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) (v18+) and `npm` installed.

### 1. Clone the repository

```bash
git clone https://github.com/immortal4728/AnimeOn.git
cd AnimeOn
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory with your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or the port displayed in your terminal) in your browser.

---

## 🔒 Security & Data Privacy

- **Account Isolation**: Every user's media library and theme settings are bound strictly to their authenticated account UID.
- **Zero Social Noise**: Pure personal tracking without public profiles, follower feeds, or rating pressure.

---

## 👨‍💻 Developer & Maintenance

Built with ❤️ by **Conan** ([@immortal4728](https://github.com/immortal4728)).

© 2026 ANIME ON · All rights reserved.
