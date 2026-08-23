import { useState } from "react";
import { toast } from "sonner";

import { lovable } from "@/integrations/lovable/index";

export function GoogleButton({ className = "" }: { className?: string }) {
  const [loading, setLoading] = useState(false);

  async function signIn() {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setLoading(false);
      toast.error("Could not sign in with Google");
      return;
    }
    if (result.redirected) return;
    window.location.href = "/watchlist";
  }

  return (
    <button
      onClick={signIn}
      disabled={loading}
      className={`inline-flex items-center justify-center gap-3 rounded-md border border-neon/60 bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground shadow-[0_0_24px_-4px_var(--neon)] transition-transform hover:-translate-y-0.5 disabled:opacity-60 ${className}`}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path
          fill="currentColor"
          d="M21.35 11.1H12v2.9h5.35c-.23 1.4-1.64 4.1-5.35 4.1a5.9 5.9 0 1 1 0-11.8c1.68 0 2.8.72 3.44 1.33l2.35-2.27C16.4 3.9 14.42 3 12 3a9 9 0 1 0 0 18c5.2 0 8.63-3.65 8.63-8.8 0-.59-.06-1.04-.28-1.1Z"
        />
      </svg>
      {loading ? "Connecting…" : "Continue with Google"}
    </button>
  );
}
