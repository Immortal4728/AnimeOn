import { useState, useEffect } from "react";
import { toast } from "sonner";
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from "firebase/auth";

import { auth } from "@/lib/firebase";
import { recordUserProfile } from "@/lib/user-registry";

export function GoogleButton({ className = "" }: { className?: string }) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Process Firebase Auth redirect result if returning from Google OAuth redirect
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          const u = result.user;
          recordUserProfile({
            id: u.uid,
            email: u.email,
            created_at: u.metadata.creationTime
              ? new Date(u.metadata.creationTime).toISOString()
              : new Date().toISOString(),
          });
          toast.success(`Welcome ${u.displayName || u.email || ""}`);
          window.location.href = "/watchlist";
        }
      })
      .catch((err) => {
        console.error("Firebase Redirect Login Error:", err);
      });
  }, []);

  async function signIn() {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    try {
      // 1. Direct Firebase Google Authentication via Popup
      const userCredential = await signInWithPopup(auth, provider);

      if (userCredential.user) {
        const u = userCredential.user;
        recordUserProfile({
          id: u.uid,
          email: u.email,
          created_at: u.metadata.creationTime
            ? new Date(u.metadata.creationTime).toISOString()
            : new Date().toISOString(),
        });

        toast.success(`Welcome ${u.displayName || u.email || ""}`);
        window.location.href = "/watchlist";
        return;
      }
    } catch (err: any) {
      console.warn("Firebase Google Popup failed, switching to Redirect flow:", err?.message || err);
      try {
        // 2. Firebase Redirect fallback (guarantees Firebase Auth session)
        await signInWithRedirect(auth, provider);
      } catch (redirectErr: any) {
        setLoading(false);
        toast.error("Google sign-in error: " + (redirectErr?.message || err?.message || "Authentication failed"));
      }
    }
  }

  return (
    <button
      onClick={signIn}
      disabled={loading}
      className={`inline-flex items-center justify-center gap-3 rounded-xl border border-neon/70 bg-primary px-6 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground shadow-[0_0_30px_rgba(236,72,153,0.35)] transition-all duration-300 hover:scale-[1.02] hover:bg-primary/95 hover:shadow-[0_0_40px_rgba(236,72,153,0.55)] active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none cursor-pointer ${className}`}
    >
      {loading ? (
        <div className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
      ) : (
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" className="shrink-0 drop-shadow">
          <path
            fill="currentColor"
            d="M21.35 11.1H12v2.9h5.35c-.23 1.4-1.64 4.1-5.35 4.1a5.9 5.9 0 1 1 0-11.8c1.68 0 2.8.72 3.44 1.33l2.35-2.27C16.4 3.9 14.42 3 12 3a9 9 0 1 0 0 18c5.2 0 8.63-3.65 8.63-8.8 0-.59-.06-1.04-.28-1.1Z"
          />
        </svg>
      )}
      <span>{loading ? "Connecting…" : "Continue with Google"}</span>
    </button>
  );
}
