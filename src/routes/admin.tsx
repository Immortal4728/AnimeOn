import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { Shield, Lock, Mail, Key, Eye, EyeOff } from "lucide-react";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";

import { auth } from "@/lib/firebase";
import { supabase } from "@/integrations/supabase/client";
import { fetchAllUsers, recordUserProfile } from "@/lib/user-registry";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Anime On" },
      { name: "description", content: "Anime On Admin Portal" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

const ADMIN_EMAIL = "chowdaryrishi41@gmail.com";
const ADMIN_PASSWORD = "@Alienhunter;";
const SESSION_KEY = "animeon_admin_auth_token";
const ITEMS_PER_PAGE = 25;

interface UserProfile {
  id: string;
  email: string | null;
  created_at: string;
}

function AdminPage() {
  const navigate = useNavigate();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);

  // Login form state
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Dashboard data state
  const [loadingData, setLoadingData] = useState<boolean>(false);
  const [dataError, setDataError] = useState<boolean>(false);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Check initial admin session
  useEffect(() => {
    const checkSession = async () => {
      const storedToken = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
      const currentFbUser = auth.currentUser;

      if (storedToken === "authenticated_admin" || currentFbUser?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        setIsAuthenticated(true);
        void fetchDashboardData();
      } else {
        setIsAuthenticated(false);
      }
      setCheckingAuth(false);
    };

    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        setIsAuthenticated(true);
        void fetchDashboardData();
      }
    });

    void checkSession();
    return () => unsubscribe();
  }, []);

  const fetchDashboardData = async () => {
    setLoadingData(true);
    setDataError(false);

    try {
      const currentFbUser = auth.currentUser;
      if (currentFbUser) {
        recordUserProfile({
          id: currentFbUser.uid,
          email: currentFbUser.email,
          created_at: currentFbUser.metadata.creationTime
            ? new Date(currentFbUser.metadata.creationTime).toISOString()
            : undefined,
        });
      } else {
        recordUserProfile({
          id: "admin_master_id",
          email: ADMIN_EMAIL,
        });
      }

      const allUsers = await fetchAllUsers();
      setProfiles(allUsers);
    } catch (err) {
      console.error(err);
      setDataError(true);
    } finally {
      setLoadingData(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const cleanEmail = emailInput.trim().toLowerCase();
    const cleanPassword = passwordInput.trim();

    if (cleanEmail !== ADMIN_EMAIL.toLowerCase()) {
      setLoginError(`Access Denied: ${cleanEmail || "This email"} is not authorized for admin access.`);
      toast.error("Unauthorized email address");
      return;
    }

    setLoginLoading(true);

    try {
      let firebaseAuthSuccess = false;

      // 1. Authenticate via Firebase Auth SDK
      try {
        const userCred = await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
        if (userCred.user && userCred.user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
          firebaseAuthSuccess = true;
        }
      } catch (fbErr: any) {
        console.warn("Firebase Auth sign-in notice:", fbErr?.message || fbErr);
      }

      // 2. Local credential fallback verification
      const matchesCredential = cleanPassword === ADMIN_PASSWORD;

      if (!firebaseAuthSuccess && !matchesCredential) {
        setLoginError("Invalid admin credentials. Access denied.");
        toast.error("Incorrect password");
        setLoginLoading(false);
        return;
      }

      recordUserProfile({
        id: auth.currentUser?.uid || "admin_master_id",
        email: ADMIN_EMAIL,
      });

      // Save authenticated admin token
      sessionStorage.setItem(SESSION_KEY, "authenticated_admin");
      localStorage.setItem(SESSION_KEY, "authenticated_admin");

      setIsAuthenticated(true);
      toast.success("Admin access granted. Welcome, Master Admin!");
      await fetchDashboardData();
    } catch (err) {
      console.error(err);
      toast.error("Login verification failed");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleAdminLogout = async () => {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_KEY);
    await auth.signOut();
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    toast.info("Admin logged out");
  };

  // Compute Statistics
  const stats = useMemo(() => {
    const total = profiles.length;
    const now = new Date();

    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const sevenDaysAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
    const thirtyDaysAgo = now.getTime() - 30 * 24 * 60 * 60 * 1000;

    let today = 0;
    let week = 0;
    let month = 0;

    profiles.forEach((p) => {
      const createdAt = new Date(p.created_at).getTime();
      if (createdAt >= startOfToday) today++;
      if (createdAt >= sevenDaysAgo) week++;
      if (createdAt >= thirtyDaysAgo) month++;
    });

    return { total, today, week, month };
  }, [profiles]);

  // Pagination logic
  const totalPages = Math.ceil(profiles.length / ITEMS_PER_PAGE) || 1;
  const paginatedProfiles = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return profiles.slice(start, start + ITEMS_PER_PAGE);
  }, [profiles, currentPage]);

  const formatJoinedDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  if (checkingAuth) {
    return (
      <main className="scanlines flex min-h-screen items-center justify-center bg-[#07090e] text-foreground">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </main>
    );
  }

  // 1. UNAUTHENTICATED: RENDER ADMIN LOGIN FORM
  if (!isAuthenticated) {
    return (
      <main className="scanlines relative flex min-h-screen items-center justify-center bg-[#07090e] px-4 py-12 text-foreground">
        <div className="w-full max-w-md space-y-8 rounded-2xl border border-border/40 bg-card/60 p-8 backdrop-blur-xl shadow-[0_0_50px_rgba(139,92,246,0.15)]">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/40 bg-primary/10 text-primary shadow-[0_0_20px_rgba(139,92,246,0.3)]">
              <Shield className="h-7 w-7" />
            </div>
            <h1 className="mt-5 font-display text-2xl font-bold uppercase tracking-[0.18em] text-foreground">
              ADMIN GATEWAY
            </h1>
            <p className="mt-1.5 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Restricted Portal Access
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-5">
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
                Admin Identity (ID)
              </label>
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Enter admin email ID"
                className="w-full rounded-lg border border-border bg-secondary/60 px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                <Key className="h-3.5 w-3.5" />
                Admin Secret Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-lg border border-border bg-secondary/60 px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-1 focus:ring-primary pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-center text-xs text-destructive">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-primary/60 bg-primary py-3 text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground shadow-[0_0_20px_rgba(139,92,246,0.3)] transition hover:bg-primary/90 disabled:opacity-50"
            >
              <Lock className="h-4 w-4" />
              {loginLoading ? "VERIFYING CREDENTIALS…" : "AUTHENTICATE"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  // SKELETON LOADING STATE FOR DASHBOARD
  if (loadingData) {
    return (
      <main className="scanlines min-h-screen bg-[#07090e] px-6 py-8 md:px-12 lg:px-16 text-foreground">
        <div className="mx-auto max-w-5xl space-y-10 animate-pulse">
          <div className="flex justify-between items-center border-b border-border/20 pb-6">
            <div className="h-5 w-40 rounded bg-secondary/40" />
            <div className="h-4 w-32 rounded bg-secondary/40" />
          </div>
          <div className="space-y-4">
            <div className="h-4 w-24 rounded bg-secondary/40" />
            <div className="h-32 w-full rounded-xl bg-secondary/30" />
            <div className="grid grid-cols-3 gap-4">
              <div className="h-20 rounded-xl bg-secondary/30" />
              <div className="h-20 rounded-xl bg-secondary/30" />
              <div className="h-20 rounded-xl bg-secondary/30" />
            </div>
          </div>
          <div className="h-64 rounded-xl bg-secondary/30" />
        </div>
      </main>
    );
  }

  // ERROR STATE FOR DASHBOARD
  if (dataError) {
    return (
      <main className="scanlines min-h-screen bg-[#07090e] flex items-center justify-center p-6 text-foreground">
        <div className="text-center space-y-4 max-w-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-foreground">
            Unable to load user data.
          </p>
          <button
            onClick={fetchDashboardData}
            className="rounded border border-primary/50 bg-primary/10 px-6 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-primary hover:bg-primary/20 transition-colors"
          >
            TRY AGAIN
          </button>
        </div>
      </main>
    );
  }

  // 2. AUTHENTICATED: RENDER ADMIN DASHBOARD
  return (
    <main className="scanlines min-h-screen bg-[#07090e] text-foreground px-4 sm:px-6 py-6 md:px-12 lg:px-16">
      <div className="mx-auto max-w-5xl space-y-8 sm:space-y-12">
        {/* STICKY GLASS HEADER */}
        <header className="sticky top-2 sm:top-4 z-40 mb-6 sm:mb-10 rounded-2xl border border-border/40 bg-card/60 px-4 sm:px-6 py-3.5 sm:py-4 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
            <div className="font-display text-sm sm:text-base tracking-[0.2em] text-foreground flex items-center gap-2 sm:gap-2.5">
              <Shield className="h-4 sm:h-5 w-4 sm:w-5 text-primary animate-pulse" />
              <span>ANIME ON</span>
              <span className="text-muted-foreground">/</span>
              <span className="text-primary font-semibold drop-shadow-[0_0_12px_rgba(139,92,246,0.5)]">ADMIN</span>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 text-xs uppercase tracking-[0.18em]">
              <Link
                to="/watchlist"
                className="rounded-lg border border-border/50 bg-secondary/30 px-3 sm:px-3.5 py-1.5 sm:py-2 font-medium text-muted-foreground hover:bg-secondary/60 hover:text-foreground transition-all"
              >
                Watchlist
              </Link>
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 sm:px-3.5 py-1.5 sm:py-2 font-semibold text-destructive hover:bg-destructive/20 hover:border-destructive transition-all shadow-[0_0_12px_rgba(239,68,68,0.15)]"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* OVERVIEW SECTION */}
        <section className="space-y-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-primary/80">
              OVERVIEW
            </span>
            <h1 className="mt-1 font-display text-3xl font-bold uppercase tracking-[0.16em] text-foreground">
              Users
            </h1>
          </div>

          {/* Primary Statistic: Total Users */}
          <div className="rounded-xl border border-border/30 bg-card/40 p-8 backdrop-blur-sm">
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold">
              TOTAL USERS
            </span>
            <div className="mt-2 font-display text-5xl font-bold tracking-tight text-foreground">
              {stats.total.toLocaleString()}
            </div>
          </div>

          {/* Sub-statistics */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border/30 bg-card/40 p-6 backdrop-blur-sm">
              <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
                TODAY
              </span>
              <div className="mt-2 font-display text-2xl font-bold text-foreground">
                {stats.today.toLocaleString()}
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground/80">new users</p>
            </div>

            <div className="rounded-xl border border-border/30 bg-card/40 p-6 backdrop-blur-sm">
              <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
                THIS WEEK
              </span>
              <div className="mt-2 font-display text-2xl font-bold text-foreground">
                {stats.week.toLocaleString()}
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground/80">new users</p>
            </div>

            <div className="rounded-xl border border-border/30 bg-card/40 p-6 backdrop-blur-sm">
              <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
                THIS MONTH
              </span>
              <div className="mt-2 font-display text-2xl font-bold text-foreground">
                {stats.month.toLocaleString()}
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground/80">new users</p>
            </div>
          </div>
        </section>

        {/* RECENT USERS SECTION */}
        <section className="space-y-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-primary/80">
              RECENT USERS
            </span>
            <h2 className="mt-1 font-display text-2xl font-bold uppercase tracking-[0.16em] text-foreground">
              Latest arrivals
            </h2>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-border/30 bg-card/40 backdrop-blur-sm">
            {profiles.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <p className="font-display text-lg uppercase tracking-[0.18em] text-foreground">
                  NO USERS YET
                </p>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Your first users will appear here.
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border/30 bg-secondary/20 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  <tr>
                    <th className="py-4 px-6 font-semibold">User</th>
                    <th className="py-4 px-6 font-semibold text-right sm:text-left">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {paginatedProfiles.map((p) => (
                    <tr key={p.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="py-4 px-6 font-medium text-foreground">
                        {p.email || "Google Account"}
                      </td>
                      <td className="py-4 px-6 text-muted-foreground text-right sm:text-left font-mono">
                        {formatJoinedDate(p.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 text-xs uppercase tracking-[0.18em]">
              <div className="flex items-center justify-between w-full sm:w-auto gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 min-h-[40px] rounded border border-border/40 hover:bg-secondary/40 disabled:opacity-40 transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 min-h-[40px] rounded border border-border/40 hover:bg-secondary/40 disabled:opacity-40 transition-colors sm:hidden"
                >
                  Next
                </button>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-1 scrollbar-none">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`h-8 w-8 min-w-[32px] rounded text-center transition ${
                      page === currentPage
                        ? "bg-primary text-primary-foreground font-bold"
                        : "hover:bg-secondary/40 text-muted-foreground"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 min-h-[40px] rounded border border-border/40 hover:bg-secondary/40 disabled:opacity-40 transition-colors hidden sm:block"
              >
                Next
              </button>
            </div>
          )}
        </section>
      </div>

      {/* ADMIN LOGOUT CONFIRMATION MODAL */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-2xl border border-border/40 bg-[#0c0e17] p-6 space-y-6 text-center shadow-2xl">
            <div className="space-y-2">
              <h3 className="font-display text-xl font-bold uppercase tracking-[0.16em] text-foreground">
                ADMIN LOGOUT
              </h3>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Are you sure you want to exit the Admin Gateway?
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 rounded-lg border border-border/50 bg-secondary/30 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground hover:bg-secondary/60 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  void handleAdminLogout();
                }}
                className="flex-1 rounded-lg border border-destructive/60 bg-destructive/20 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-destructive hover:bg-destructive/30 transition-colors"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
