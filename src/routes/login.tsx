import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";

import retroHero from "@/assets/retro-hero.jpg";
import { GoogleButton } from "@/components/google-button";
import { supabase } from "@/integrations/supabase/client";
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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate({ to: "/watchlist", replace: true });
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/watchlist", replace: true });
    });

    return () => unsubscribe();
  }, [navigate]);

  return (
    <main className="scanlines relative min-h-screen bg-[#07090e] text-foreground flex flex-col lg:flex-row overflow-hidden">
      {/* Back to Home Link */}
      <a
        href="/"
        className="absolute top-6 left-6 z-30 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-foreground/80 hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </a>

      {/* Cinematic Left Hero Banner */}
      <div className="relative isolate hidden lg:flex lg:w-1/2 flex-col justify-between p-12 overflow-hidden border-r border-border/20">
        <img
          src={retroHero}
          alt="Retro neon sunset horizon"
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#07090e] via-ink/60 to-transparent" />

        <div className="z-10 pt-16">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-primary/90">
            PERSONAL SHELF
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold uppercase tracking-[0.16em] text-foreground drop-shadow-[0_0_20px_var(--neon)]">
            One quiet place for everything worth watching.
          </h2>
        </div>

        <div className="z-10 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          © 2026 ANIME ON · RETRO EDITION
        </div>
      </div>

      {/* Authentication Right Panel */}
      <div className="relative flex min-h-screen lg:min-h-0 flex-1 flex-col items-center justify-center p-6 lg:p-16 bg-[#07090e]">
        {/* Subtle background glow for mobile */}
        <div className="absolute inset-0 -z-10 lg:hidden opacity-30">
          <img src={retroHero} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-[#07090e]/90" />
        </div>

        <div className="w-full max-w-md space-y-8 text-center rounded-2xl border border-border/30 bg-card/60 p-8 sm:p-10 backdrop-blur-xl shadow-[0_0_40px_rgba(139,92,246,0.1)]">
          <div>
            <span className="font-display text-2xl uppercase tracking-[0.2em] text-foreground drop-shadow-[0_0_18px_var(--neon)]">
              ANIME ON
            </span>
            <h1 className="mt-6 font-display text-3xl font-bold uppercase tracking-[0.16em] text-foreground">
              WELCOME BACK
            </h1>
            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Your saved worlds are waiting.
            </p>
          </div>

          <div className="pt-2">
            <GoogleButton className="w-full py-3.5" />
          </div>

          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70">
            One account. One private watchlist.
          </p>
        </div>
      </div>
    </main>
  );
}
