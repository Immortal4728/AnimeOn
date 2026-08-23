import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import retroHero from "@/assets/retro-hero.jpg";
import { GoogleButton } from "@/components/google-button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Watchlist — Save what you want to watch and play" },
      {
        name: "description",
        content:
          "A beautiful personal shelf for anime, movies, K-dramas, shows and games you want to remember.",
      },
      { property: "og:title", content: "Watchlist — Save what you want to watch and play" },
      {
        property: "og:description",
        content: "Sign in with Google and keep one simple list of everything you mean to watch.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/watchlist", replace: true });
    });
  }, [navigate]);

  return (
    <main className="scanlines relative isolate flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
      <img
        src={retroHero}
        alt="Retro neon sunset over a glowing grid horizon"
        width={1920}
        height={1080}
        className="absolute inset-0 -z-10 h-full w-full object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-ink/55" />

      <h1 className="font-display text-5xl uppercase tracking-[0.18em] text-foreground drop-shadow-[0_0_28px_var(--neon)] sm:text-7xl">
        Watchlist
      </h1>
      <p className="mt-6 max-w-md text-sm uppercase tracking-[0.25em] text-foreground/80">
        Everything you mean to watch. One quiet shelf.
      </p>

      <GoogleButton className="mt-12" />
    </main>
  );
}
