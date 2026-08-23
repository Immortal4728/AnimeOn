import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";

import retroHero from "@/assets/retro-hero.jpg";
import { GoogleButton } from "@/components/google-button";
import { auth } from "@/lib/firebase";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — Anime On" },
      { name: "description", content: "Welcome back to Anime On. Sign in to access your personal shelf." },
      { property: "og:title", content: "Login — Anime On" },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    // Only navigate to watchlist when Firebase Auth user is present
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate({ to: "/watchlist", replace: true });
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  return (
    <main className="scanlines relative min-h-screen bg-[#07090e] text-foreground flex flex-col lg:flex-row overflow-hidden">
      {/* Back to Home Link */}
      <a
        href="/"
        className="absolute top-4 left-4 sm:top-6 sm:left-6 z-30 inline-flex items-center gap-2 rounded-xl border border-border/40 bg-card/40 px-3.5 sm:px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] sm:tracking-[0.18em] text-muted-foreground hover:text-foreground hover:border-neon/50 hover:bg-card/70 transition-all duration-300 backdrop-blur-md shadow-lg min-h-[40px] sm:min-h-[44px]"
      >
        <ArrowLeft className="h-4 w-4 text-neon shrink-0" />
        Back to Home
      </a>

      {/* Cinematic Left Hero Banner */}
      <div className="relative isolate hidden lg:flex lg:w-1/2 flex-col justify-between p-12 overflow-hidden border-r border-border/30">
        <img
          src={retroHero}
          alt="Retro neon sunset horizon"
          className="absolute inset-0 -z-10 h-full w-full object-cover brightness-[0.7]"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#07090e] via-[#07090e]/50 to-transparent" />
        <div className="absolute top-1/3 left-1/4 h-80 w-80 rounded-full bg-neon/15 blur-[120px] pointer-events-none" />

        <div className="z-10 pt-16 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-neon/40 bg-neon/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-neon backdrop-blur-md shadow-[0_0_20px_rgba(236,72,153,0.2)] crt-flicker">
            <span className="h-2 w-2 rounded-full bg-neon animate-pulse" />
            PERSONAL ARCHIVE
          </div>
          <h2 className="font-display text-4xl lg:text-5xl font-extrabold uppercase tracking-[0.14em] sm:tracking-[0.16em] text-foreground drop-shadow-[0_0_25px_var(--neon)] leading-tight max-w-xl">
            <span className="crt-glitch" data-text="One quiet shelf for everything worth remembering.">
              One quiet shelf for everything worth remembering.
            </span>
          </h2>
          <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-muted-foreground max-w-md leading-relaxed">
            Save anime, movies, K-dramas, web series, and games to your private collection.
          </p>
        </div>

        <div className="z-10 flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-muted-foreground/80 border-t border-border/20 pt-6">
          <span>© 2026 ANIME ON</span>
          <span className="text-neon/80 font-bold crt-flicker">RETRO EDITION</span>
        </div>
      </div>

      {/* Authentication Right Panel */}
      <div className="relative flex min-h-screen lg:min-h-0 flex-1 flex-col items-center justify-center p-4 sm:p-8 lg:p-16 bg-[#07090e]">
        {/* Ambient Pink Glow Blob */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-neon/15 blur-[140px] pointer-events-none" />

        {/* Subtle background glow for mobile */}
        <div className="absolute inset-0 -z-10 lg:hidden opacity-20">
          <img src={retroHero} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-[#07090e]/90" />
        </div>

        <div className="relative w-full max-w-md space-y-6 sm:space-y-8 text-center rounded-3xl border border-border/40 bg-card/40 p-6 sm:p-12 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] mt-12 lg:mt-0">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 font-display text-xl sm:text-2xl uppercase tracking-[0.22em] text-foreground drop-shadow-[0_0_20px_var(--neon)]">
              <span className="h-2 w-2 rounded-full bg-neon animate-ping" />
              <span className="crt-glitch" data-text="ANIME ON">
                ANIME ON
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-[0.14em] sm:tracking-[0.16em] text-foreground drop-shadow-[0_0_25px_var(--neon)]">
              <span className="crt-glitch" data-text="WELCOME BACK">
                WELCOME BACK
              </span>
            </h1>
            <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-muted-foreground font-medium">
              Your saved worlds are waiting.
            </p>
          </div>

          <div className="pt-2">
            <GoogleButton className="w-full py-4 text-xs sm:text-sm font-bold min-h-[44px]" />
          </div>

          <div className="space-y-3 pt-2 border-t border-border/20">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/90 font-mono">
              One account · Private Firestore storage
            </p>
            <div className="flex flex-wrap justify-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground/70 font-mono">
              <span>Anime</span> · <span>Movies</span> · <span>K-Dramas</span> · <span>Games</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
