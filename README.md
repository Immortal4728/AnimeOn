# 🌌 Anime On — Retro Personal Media Shelf

> **Save what catches your attention. Come back whenever you're ready.**

Anime On is a minimalist, retro-futuristic personal media shelf designed for keeping track of your favorite anime, movies, K-dramas, web series, and games without social noise, rating wars, or algorithmic feeds.

---

## ✨ Key Features

- 🎌 **Multi-Category Archive**: Track **Anime**, **Movies**, **K-Dramas**, **Web Series**, **Games**, and **Links** under a unified dashboard.
- 🎨 **Dynamic Theme System**: Switch between custom themes (*Neon Pink*, *Cyber Purple*, *Electric Blue*, *Crimson*, *Matrix Green*, and more) stored per authenticated user in Cloud Firestore.
- ⚡ **Instant Search & Filters**: Filter by status (*Want to Watch*, *Completed*) or perform real-time search across titles and notes.
- 📱 **Mobile-First Responsive Layout**: Built and optimized for seamless experience across all viewports (from 320px mobile phones to ultra-wide displays).
- 🔒 **Private & Secure**: User data is isolated and protected via strict Firestore Security Rules tied to Firebase Authentication (Google Auth).
- 🛡️ **Admin Gateway**: Restricted portal for system administrators to view real-time platform statistics and user analytics.

---

## 🛠️ Technology Stack

- **Frontend**: [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Routing**: [TanStack Router](https://tanstack.com/router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/), Lucide Icons
- **Backend & Auth**: [Firebase Auth](https://firebase.google.com/docs/auth), [Cloud Firestore](https://firebase.google.com/docs/firestore)
- **Database & Integrations**: [Supabase](https://supabase.com/)
- **Toasts & UI**: Sonner

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

### 3. Start development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) or the port displayed in your terminal.

---

## 🛡️ Security Rules (Firestore)

User watchlists and preferences are isolated to each authenticated user:

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid}/watchlist/{itemId} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    match /users/{uid}/preferences/{preferenceId} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

---

## 👨‍💻 Developer & Maintenance

Built with ❤️ by **Conan** ([@immortal4728](https://github.com/immortal4728)).

© 2026 ANIME ON · All rights reserved.
