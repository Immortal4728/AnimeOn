import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { GoogleButton } from "@/components/google-button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Watchlist" },
      { name: "description", content: "Sign in with Google to open your personal watchlist." },
      { property: "og:title", content: "Sign in — Watchlist" },
      { property: "og:description", content: "Google sign-in for your personal watchlist." },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/watchlist", replace: true });
    });
  }, [navigate]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 text-center">
      <h1 className="font-display text-4xl uppercase tracking-[0.18em] drop-shadow-[0_0_24px_var(--neon)]">
        Watchlist
      </h1>
      <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
        Sign in to open your shelf
      </p>
      <GoogleButton />
    </main>
  );
}
