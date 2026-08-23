import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, Film, Bookmark, ShieldCheck, Github, ExternalLink } from "lucide-react";


export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Anime On" },
      { name: "description", content: "Learn about Anime On — your minimalist retro shelf for anime, movies, dramas, and games." },
      { property: "og:title", content: "About — Anime On" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <main className="scanlines min-h-screen bg-[#07090e] text-foreground">
      {/* TOP NAVIGATION HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#07090e]/90 backdrop-blur-xl border-b border-border/30 py-3.5 sm:py-4 px-4 sm:px-6 lg:px-12 shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link
            to="/"
            className="group flex items-center gap-2 sm:gap-2.5 font-display text-base sm:text-lg uppercase tracking-[0.2em] text-foreground drop-shadow-[0_0_20px_var(--neon)] transition-transform hover:scale-105"
          >
            <Sparkles className="h-4 w-4 text-neon animate-pulse" />
            ANIME ON
          </Link>

          <nav className="flex items-center gap-4 sm:gap-10 text-[11px] sm:text-xs uppercase tracking-[0.2em]">
            <Link to="/" className="text-foreground/70 hover:text-foreground transition-colors">
              HOME
            </Link>
            <Link to="/about" className="text-foreground font-bold text-neon transition-colors">
              ABOUT
            </Link>
            <Link
              to="/login"
              className="rounded-xl border border-neon/60 bg-primary/20 px-3.5 sm:px-5 py-1.5 sm:py-2 font-bold text-primary-foreground shadow-[0_0_20px_rgba(139,92,246,0.35)] transition-all hover:bg-primary hover:shadow-[0_0_25px_var(--neon)] hover:scale-105"
            >
              LOGIN
            </Link>
          </nav>
        </div>
      </header>

      {/* HERO / INTRO */}
      <section className="relative pt-36 pb-16 px-6 lg:px-12">
        <div className="mx-auto max-w-4xl text-center space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-neon/40 bg-neon/10 px-4 py-1 text-xs font-bold uppercase tracking-[0.25em] text-neon shadow-[0_0_15px_rgba(236,72,153,0.2)]">
            THE PURPOSE
          </span>
          <h1 className="font-display text-4xl sm:text-6xl font-extrabold uppercase tracking-[0.16em] text-foreground drop-shadow-[0_0_30px_var(--neon)]">
            ABOUT ANIME ON
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Anime On is a minimalist personal shelf designed to keep track of your favorite media without social noise, algorithmic feeds, or bloated clutter.
          </p>
        </div>
      </section>

      {/* CORE PHILOSOPHY CARDS */}
      <section className="py-12 px-6 lg:px-12 border-t border-border/20">
        <div className="mx-auto max-w-6xl space-y-12">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-neon">
              CORE PHILOSOPHY
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-[0.18em]">
              Simple. Intentional. Yours.
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-border/40 bg-card/40 p-8 backdrop-blur-sm space-y-4 hover:border-neon/50 transition-colors">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-neon/40 bg-neon/10 text-neon">
                <Bookmark className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg font-bold uppercase tracking-[0.16em]">
                Discover & Save
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Found a new anime, K-drama, movie, or game? Add it to your shelf instantly and organize what you want to watch or play.
              </p>
            </div>

            <div className="rounded-2xl border border-border/40 bg-card/40 p-8 backdrop-blur-sm space-y-4 hover:border-neon/50 transition-colors">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/40 bg-primary/10 text-primary">
                <Film className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg font-bold uppercase tracking-[0.16em]">
                Zero Distractions
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                No ratings wars, social feeds, or complex algorithms. Just your personal list waiting for your next movie night or gaming session.
              </p>
            </div>

            <div className="rounded-2xl border border-border/40 bg-card/40 p-8 backdrop-blur-sm space-y-4 hover:border-neon/50 transition-colors">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-neon/40 bg-neon/10 text-neon">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg font-bold uppercase tracking-[0.16em]">
                Multi-Category
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Seamlessly supports Anime, Movies, K-Dramas, TV Shows, Web Series, and Games all under a unified retro dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SUPPORTED CATEGORIES */}
      <section className="py-16 px-6 lg:px-12 bg-secondary/10 border-t border-b border-border/20">
        <div className="mx-auto max-w-4xl text-center space-y-8">
          <h2 className="font-display text-2xl font-bold uppercase tracking-[0.2em] text-foreground">
            SUPPORTED CATEGORIES
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {["Anime", "Movies", "K-Dramas", "TV Shows", "Web Series", "Games"].map((cat) => (
              <span
                key={cat}
                className="rounded-full border border-neon/40 bg-card/60 px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-foreground shadow-[0_0_15px_rgba(236,72,153,0.15)]"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* DEVELOPER SECTION */}
      <section className="py-20 px-6 lg:px-12 border-t border-border/20">
        <div className="mx-auto max-w-4xl space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-neon">
              BEHIND THE PLATFORM
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold uppercase tracking-[0.18em] text-foreground">
              THE DEVELOPER
            </h2>
          </div>

          <div className="rounded-3xl border border-border/40 bg-card/40 p-8 sm:p-10 backdrop-blur-xl shadow-[0_0_50px_rgba(236,72,153,0.1)] flex flex-col sm:flex-row items-center gap-8 sm:gap-12">
            {/* Developer Avatar */}
            <div className="relative shrink-0">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-neon to-primary opacity-70 blur-md animate-pulse" />
              <img
                src="/Rishi.png"
                alt="Conan"
                className="relative h-36 w-36 sm:h-44 sm:w-44 rounded-2xl object-cover border-2 border-neon/60 shadow-2xl"
              />
            </div>

            {/* Developer Details */}
            <div className="space-y-4 text-center sm:text-left flex-1">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-neon">
                  LEAD CREATOR & DEVELOPER
                </span>
                <h3 className="font-display text-3xl font-bold uppercase tracking-[0.16em] text-foreground">
                  Conan
                </h3>
                <p className="text-xs font-mono text-muted-foreground mt-0.5">
                  @immortal4728
                </p>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Architect & Full-Stack Engineer behind Anime On. Building clean, high-performance applications with rich retro-futuristic aesthetics and seamless user experiences.
              </p>

              <div className="pt-2">
                <a
                  href="https://github.com/immortal4728"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 rounded-xl border border-neon/60 bg-primary/20 px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all hover:bg-primary hover:shadow-[0_0_25px_var(--neon)] hover:scale-105"
                >
                  <Github className="h-4 w-4" />
                  GitHub Profile
                  <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-6 text-center text-xs uppercase tracking-[0.2em] text-muted-foreground border-t border-border/20">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>ANIME ON · RETRO EDITION</span>
          <span>© 2026 ANIME ON. ALL RIGHTS RESERVED.</span>
        </div>
      </footer>
    </main>
  );
}
