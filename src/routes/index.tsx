import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Sparkles, Bookmark, CheckCircle2 } from "lucide-react";

import retroHero from "@/assets/retro-hero.jpg";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Anime On — Save what you want to watch and play" },
      {
        name: "description",
        content:
          "A beautiful personal shelf for anime, movies, K-dramas, shows and games you want to remember on Anime On.",
      },
      { property: "og:title", content: "Anime On — Save what you want to watch and play" },
      {
        property: "og:description",
        content: "Discover something, save it, and revisit it whenever you are ready.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [, setHoveredCategory] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/watchlist", replace: true });
    });

    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [navigate]);

  return (
    <main id="top" className="scanlines min-h-screen bg-[#07090e] text-foreground overflow-x-hidden">
      {/* 2. TOP NAVIGATION HEADER */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 sm:px-6 lg:px-12 ${
          isScrolled
            ? "bg-[#07090e]/90 backdrop-blur-xl border-b border-border/30 py-3 sm:py-4 shadow-[0_4px_30px_rgba(0,0,0,0.8)]"
            : "bg-transparent py-4 sm:py-6"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          {/* Left: Logo */}
          <a
            href="#top"
            className="group flex items-center gap-2 sm:gap-2.5 font-display text-base sm:text-lg uppercase tracking-[0.2em] text-foreground drop-shadow-[0_0_20px_var(--neon)] transition-transform hover:scale-105"
          >
            <span className="h-2 w-2 rounded-full bg-neon animate-ping" />
            ANIME ON
          </a>

          {/* Center/Right: Subtle Nav Links & Login */}
          <nav className="flex items-center gap-4 sm:gap-10 text-[11px] sm:text-xs uppercase tracking-[0.2em]">
            <a href="#top" className="text-foreground/70 hover:text-foreground transition-colors hidden sm:inline-block">
              HOME
            </a>
            <Link to="/about" className="text-foreground/70 hover:text-foreground transition-colors">
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

      {/* 3. HERO SECTION */}
      <section className="relative isolate flex min-h-screen flex-col items-center justify-center px-6 text-center pt-16">
        <img
          src={retroHero}
          alt="Retro neon sunset horizon"
          width={1920}
          height={1080}
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-ink/55" />

        <div className="max-w-4xl space-y-4 sm:space-y-6">
          <h1 className="font-display text-4xl sm:text-7xl lg:text-8xl xl:text-9xl font-extrabold uppercase tracking-[0.12em] sm:tracking-[0.16em] text-foreground drop-shadow-[0_0_35px_var(--neon)]">
            <span className="crt-glitch" data-text="ANIME ON">
              ANIME ON
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-xs sm:text-lg lg:text-xl font-bold uppercase tracking-[0.2em] sm:tracking-[0.25em] text-foreground/90 leading-relaxed">
            <span className="crt-glitch" data-text="EVERYTHING YOU MEAN TO WATCH. ONE QUIET SHELF.">
              EVERYTHING YOU MEAN TO WATCH. ONE QUIET SHELF.
            </span>
          </p>
          <p className="text-xs sm:text-sm uppercase tracking-[0.18em] sm:tracking-[0.2em] text-muted-foreground pt-1 sm:pt-2 font-mono">
            Save what catches your attention. Come back when you're ready.
          </p>
        </div>
      </section>

      {/* 4. HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-28 px-6 border-t border-border/20 bg-background/60 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-primary/80">
              HOW IT WORKS
            </span>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl font-bold uppercase tracking-[0.16em] text-foreground">
              Three steps. Nothing complicated.
            </h2>
          </div>

          <div className="grid gap-12 lg:grid-cols-3">
            {/* STAGE 01 */}
            <div className="relative rounded-2xl border border-border/40 bg-card/40 p-8 transition hover:border-primary/40 backdrop-blur-md">
              <div className="font-display text-4xl font-bold text-primary/40 mb-4">01</div>
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-primary">DISCOVER</span>
              <h3 className="mt-2 font-display text-xl font-bold uppercase tracking-[0.14em] text-foreground">
                Find something worth remembering.
              </h3>
              <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
                Whether it is a new anime release, a classic movie, or an upcoming game.
              </p>

              {/* Atmospheric Graphic Accent */}
              <div className="mt-8 flex h-24 w-full items-center justify-center rounded-xl border border-border/40 bg-secondary/30 text-primary/60">
                <Sparkles className="h-8 w-8 animate-pulse" />
              </div>
            </div>

            {/* STAGE 02 */}
            <div className="relative rounded-2xl border border-border/40 bg-card/40 p-8 transition hover:border-primary/40 backdrop-blur-md">
              <div className="font-display text-4xl font-bold text-primary/40 mb-4">02</div>
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-primary">SAVE</span>
              <h3 className="mt-2 font-display text-xl font-bold uppercase tracking-[0.14em] text-foreground">
                Add it to your watchlist in seconds.
              </h3>
              <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
                Organize by status or format with one simple click.
              </p>

              {/* Atmospheric Graphic Accent */}
              <div className="mt-8 flex h-24 w-full items-center justify-center rounded-xl border border-border/40 bg-secondary/30 text-primary/60">
                <Bookmark className="h-8 w-8" />
              </div>
            </div>

            {/* STAGE 03 */}
            <div className="relative rounded-2xl border border-border/40 bg-card/40 p-8 transition hover:border-primary/40 backdrop-blur-md">
              <div className="font-display text-4xl font-bold text-primary/40 mb-4">03</div>
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-primary">REVISIT</span>
              <h3 className="mt-2 font-display text-xl font-bold uppercase tracking-[0.14em] text-foreground">
                Come back whenever you're ready.
              </h3>
              <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
                Your clean personal library is waiting whenever free time opens up.
              </p>

              {/* Atmospheric Graphic Accent */}
              <div className="mt-8 flex h-24 w-full items-center justify-center rounded-xl border border-border/40 bg-secondary/30 text-primary/60">
                <CheckCircle2 className="h-8 w-8 text-emerald-400/80" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. MEDIA TYPES SECTION */}
      <section className="py-28 px-6 border-t border-border/20 bg-background/80">
        <div className="mx-auto max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-primary/80">
              YOUR SHELF
            </span>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl font-bold uppercase tracking-[0.16em] text-foreground">
              Whatever kind of story you're chasing.
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 lg:gap-6">
            {[
              { label: "ANIME", desc: "Japanese animation & series" },
              { label: "MOVIES", desc: "Cinematic features & films" },
              { label: "K-DRAMAS", desc: "Korean drama series" },
              { label: "TV SERIES", desc: "Television & mini-series" },
              { label: "WEB SERIES", desc: "Streaming & indie shows" },
              { label: "GAMES", desc: "Console, PC & RPG titles" },
            ].map((cat) => (
              <div
                key={cat.label}
                onMouseEnter={() => setHoveredCategory(cat.label)}
                onMouseLeave={() => setHoveredCategory(null)}
                className="group relative overflow-hidden rounded-xl border border-border/40 bg-card/40 p-6 text-center transition-all duration-300 hover:border-primary/60 hover:bg-card/70 backdrop-blur-sm"
              >
                <h3 className="font-display text-lg sm:text-xl font-bold uppercase tracking-[0.18em] text-foreground group-hover:text-primary transition-colors">
                  {cat.label}
                </h3>
                <p className="mt-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                  {cat.desc}
                </p>

                {/* Subtle Hover Accent Glow */}
                <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. SHORT PRODUCT STATEMENT */}
      <section id="about" className="py-32 px-6 text-center border-t border-border/20 bg-background/40 relative isolate">
        <div className="mx-auto max-w-3xl space-y-6">
          <h2 className="font-display text-3xl sm:text-5xl font-bold uppercase tracking-[0.16em] text-foreground drop-shadow-[0_0_24px_var(--neon)]">
            Some things are too good to forget.
          </h2>
          <p className="text-sm sm:text-base uppercase tracking-[0.22em] text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Anime On gives them a place to wait until you're ready.
          </p>
        </div>
      </section>

      {/* 7. FINAL CTA */}
      <section className="py-28 px-6 text-center border-t border-border/20 bg-background/70 backdrop-blur-md">
        <div className="mx-auto max-w-xl space-y-6">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-primary/80">
            YOUR SHELF IS WAITING
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold uppercase tracking-[0.16em] text-foreground">
            Start remembering what you find.
          </h2>
          <div className="pt-4">
            <Link
              to="/login"
              className="inline-flex items-center gap-3 rounded-lg border border-primary/60 bg-primary px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground shadow-[0_0_24px_rgba(139,92,246,0.4)] transition hover:bg-primary/90 hover:scale-105"
            >
              LOGIN WITH GOOGLE
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 11. FOOTER */}
      <footer className="border-t border-border/30 bg-[#05060a] py-16 px-6 text-xs uppercase tracking-[0.2em] text-muted-foreground">
        <div className="mx-auto max-w-6xl space-y-12">
          <div className="grid gap-8 sm:grid-cols-3 text-center sm:text-left">
            {/* Left */}
            <div className="space-y-3">
              <div className="font-display text-base tracking-[0.18em] text-foreground">
                ANIME ON
              </div>
              <p className="text-[11px] text-muted-foreground/80 tracking-[0.2em]">
                Discover. Save. Revisit.
              </p>
            </div>

            {/* Middle: Product Links */}
            <div className="space-y-3">
              <div className="font-semibold text-foreground tracking-[0.22em] text-[11px]">
                PRODUCT
              </div>
              <ul className="space-y-2 text-[11px] text-muted-foreground">
                <li>
                  <a href="#top" className="hover:text-foreground transition-colors">
                    Home
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-foreground transition-colors">
                    How It Works
                  </a>
                </li>
                <li>
                  <Link to="/login" className="hover:text-foreground transition-colors">
                    Login
                  </Link>
                </li>
              </ul>
            </div>

            {/* Right: Supported Media */}
            <div className="space-y-3">
              <div className="font-semibold text-foreground tracking-[0.22em] text-[11px]">
                SUPPORTED
              </div>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                Anime · Movies · K-Dramas · TV Shows · Web Series · Games
              </p>
            </div>
          </div>

          <div className="border-t border-border/20 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-[11px]">
            <div>© 2026 ANIME ON</div>
            <div className="text-muted-foreground/60">Built for things worth remembering.</div>
          </div>
        </div>
      </footer>
    </main>
  );
}
