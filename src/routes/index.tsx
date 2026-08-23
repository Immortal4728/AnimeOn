import { createFileRoute } from "@tanstack/react-router";

import heroPixel from "@/assets/hero-pixel.jpg";
import ch1 from "@/assets/ch1.jpg";
import ch2 from "@/assets/ch2.jpg";
import ch3 from "@/assets/ch3.jpg";
import ch4 from "@/assets/ch4.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cofounder — Run an entire company with AI agents" },
      {
        name: "description",
        content:
          "Start with an AI roadmap, then hand off engineering, sales, marketing, design, finance, and ops to agents.",
      },
      { property: "og:title", content: "Cofounder — Run an entire company with AI agents" },
      {
        property: "og:description",
        content:
          "Agent orchestration built like a real company: departments, managers, shared context, human in the loop.",
      },
    ],
  }),
  component: Index,
});

const navLinks = ["Start", "Build", "Sell", "Scale"];

const logos = ["ActiveGraph", "Veery", "LearnPath", "Valence OS"];

const pillars = [
  {
    title: "Agentic departments",
    body: "Cofounder is designed like a real company, with departments, managers, and shared context.",
  },
  {
    title: "Human in the loop",
    body: "Agents work alongside you, requiring approval when potentially dangerous actions are taken.",
  },
  {
    title: "Fully extensible",
    body: "Easily connect MCP, custom APIs, custom skills, or an entire custom codebase to Cofounder.",
  },
];

const departments = [
  "Legal",
  "Finance",
  "Marketing",
  "Support",
  "Engineering",
  "Operations",
  "Design",
  "Sales",
];

const chapters = [
  { n: "I", num: "Chapter 1", title: "How To Start", img: ch1, href: "/how-to/start" },
  { n: "II", num: "Chapter 2", title: "How To Build", img: ch2, href: "/how-to/build" },
  { n: "III", num: "Chapter 3", title: "How To Sell", img: ch3, href: "/how-to/sell" },
  { n: "IV", num: "Chapter 4", title: "How To Scale", img: ch4, href: "/how-to/scale" },
];

const roadmap = [
  { title: "Initial Idea", kind: "User task" },
  { title: "Pick a Company Name", kind: "User task" },
  { title: "Setup Codebase", kind: "Agent task" },
  { title: "Incorporate LLC", kind: "Agent requires approval" },
  { title: "Setup Social Presence", kind: "Agent task" },
  { title: "Buy Domain", kind: "User task" },
  { title: "Logo & Brand Spec", kind: "Agent task" },
  { title: "Open Bank Account", kind: "Agent requires approval" },
];

const features = [
  {
    heading: "A full roadmap tailored to your company",
    body: "When starting a company, it's hard to know what's next. Cofounder guides you through all of the steps to get a real business started, and kicks off agents for milestones as you build.",
    learn: "How to start",
  },
  {
    heading: "Build products and manage your infrastructure with agents",
    body: "Design, build, and deploy products with engineering agents. Once you're live, infrastructure and security agents monitor and fix issues.",
    learn: "How to build",
  },
  {
    heading: "Automate sales and marketing with agents",
    body: "Cofounder handles inbox warming, email outbound campaigns, content creation, paid marketing, organic social, and analytics.",
    learn: "How to sell",
  },
];

function Index() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground antialiased">
      {/* Hero */}
      <header className="relative isolate min-h-[92vh] overflow-hidden">
        <img
          src={heroPixel}
          alt="Pixel-art meadow with a laptop open under a tree and a city skyline in the distance"
          width={1920}
          height={1088}
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-sky-deep/70 via-sky-deep/20 to-transparent" />

        <nav className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-6 lg:px-12">
          <a href="/" className="font-display text-3xl tracking-tight text-primary-foreground">
            Cofounder
          </a>
          <div className="hidden items-center gap-2 md:flex">
            <div className="flex items-center gap-1 rounded-full bg-ink/40 px-2 py-1.5 backdrop-blur-md">
              <span className="px-3 text-sm text-primary-foreground/60">How to</span>
              {navLinks.map((l) => (
                <a
                  key={l}
                  href={`/how-to/${l.toLowerCase()}`}
                  className="rounded-full px-3 py-1.5 text-sm text-primary-foreground/90 transition-colors hover:bg-primary-foreground/15"
                >
                  {l}
                </a>
              ))}
            </div>
            <a
              href="/resources"
              className="rounded-full bg-ink/40 px-4 py-2.5 text-sm text-primary-foreground backdrop-blur-md transition-colors hover:bg-ink/60"
            >
              Resources
            </a>
            <a
              href="/pricing"
              className="rounded-full bg-ink/40 px-4 py-2.5 text-sm text-primary-foreground backdrop-blur-md transition-colors hover:bg-ink/60"
            >
              Pricing
            </a>
            <a
              href="https://app.cofounder.co/"
              className="rounded-full bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-transform hover:-translate-y-0.5"
            >
              Run a company
            </a>
          </div>
        </nav>

        <div className="mx-auto max-w-[1600px] px-6 pt-16 lg:px-12 lg:pt-24">
          <h1 className="max-w-2xl text-5xl leading-[1.05] tracking-tight text-primary-foreground lg:text-6xl">
            Cofounder lets you run an entire company with AI
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-primary-foreground/85">
            Start with an AI roadmap, then hand off engineering, sales, marketing, design, finance,
            and ops to agents.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="https://app.cofounder.co/"
              className="rounded-xl bg-card px-5 py-3 text-sm font-medium text-foreground shadow-lg transition-transform hover:-translate-y-0.5"
            >
              Run a company
            </a>
            <a
              href="/resources"
              className="rounded-xl bg-ink/35 px-5 py-3 text-sm font-medium text-primary-foreground backdrop-blur-md transition-colors hover:bg-ink/55"
            >
              Check out the launch
            </a>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-40 right-[18%] hidden items-center gap-2 rounded-lg bg-ink/70 px-3 py-2 backdrop-blur-md lg:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span className="text-xs text-primary-foreground/70">Task Completed</span>
          <span className="text-xs font-semibold text-primary-foreground">Marketing Campaign</span>
        </div>
      </header>

      {/* Logo strip */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-8 px-6 py-10 lg:px-12">
          <div className="flex flex-wrap items-center gap-10">
            {logos.map((l) => (
              <span key={l} className="font-display text-2xl text-muted-foreground">
                {l}
              </span>
            ))}
          </div>
          <a href="/resources" className="text-sm text-muted-foreground hover:text-foreground">
            Case Studies →
          </a>
        </div>
        <div className="mx-auto max-w-[1600px] px-6 pb-10 lg:px-12">
          <p className="text-sm text-muted-foreground">
            over <span className="font-semibold text-foreground">10,650 companies</span> are running
            on Cofounder
          </p>
        </div>
      </section>

      {/* Orchestration */}
      <section className="bg-cream py-24">
        <div className="mx-auto max-w-[1600px] px-6 lg:px-12">
          <h2 className="max-w-3xl text-4xl leading-tight tracking-tight lg:text-5xl">
            Cofounder is an agent orchestration platform designed to help you run an entire business
          </h2>

          <div className="mt-14 overflow-hidden rounded-3xl border border-border bg-ink p-6 lg:p-10">
            <div className="flex flex-wrap items-center gap-2">
              {departments.map((d, i) => (
                <span
                  key={d}
                  className={`rounded-full px-4 py-2 text-xs ${
                    i % 3 === 0
                      ? "bg-sky text-primary-foreground"
                      : "bg-primary-foreground/10 text-primary-foreground/80"
                  }`}
                >
                  {d}
                </span>
              ))}
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {pillars.map((p) => (
                <div
                  key={p.title}
                  className="rounded-2xl border border-primary-foreground/10 bg-primary-foreground/5 p-6"
                >
                  <h3 className="text-base font-semibold text-primary-foreground">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-primary-foreground/65">
                    {p.body}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-6">
            <p className="max-w-md text-sm text-muted-foreground">
              Bring your company context into the operating system and start with the next concrete
              task.
            </p>
            <a
              href="https://app.cofounder.co/"
              className="rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              Start in Cofounder
            </a>
          </div>
        </div>
      </section>

      {/* Guide */}
      <section className="bg-background py-24">
        <div className="mx-auto max-w-[1600px] px-6 lg:px-12">
          <h2 className="text-4xl tracking-tight lg:text-5xl">Learn how to start a company</h2>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
            <p className="max-w-xl text-muted-foreground">
              Read the guide, then let Cofounder turn each step into a roadmap, tasks, and agents.
            </p>
            <a
              href="https://app.cofounder.co/"
              className="rounded-xl border border-border bg-card px-5 py-3 text-sm font-medium transition-colors hover:bg-secondary"
            >
              Put the guide to work
            </a>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {chapters.map((c) => (
              <a
                key={c.n}
                href={c.href}
                className="group overflow-hidden rounded-2xl border border-border bg-card transition-transform hover:-translate-y-1"
              >
                <div className="flex items-center justify-between px-5 pt-5">
                  <span className="text-sm font-semibold">
                    {c.num} {c.title}
                  </span>
                  <span className="font-display text-sm text-muted-foreground">
                    Chapter {c.n}
                  </span>
                </div>
                <img
                  src={c.img}
                  alt={`${c.title} chapter cover`}
                  loading="lazy"
                  width={768}
                  height={1024}
                  className="mt-4 aspect-[3/4] w-full object-cover"
                />
                <div className="flex items-center justify-between px-5 py-4 text-xs text-muted-foreground">
                  <span>by Cofounder 2026</span>
                  <span className="group-hover:text-foreground">Read chapter ({c.n}) →</span>
                </div>
              </a>
            ))}
          </div>

          <div className="mt-10">
            <a
              href="/guides/cofounder-founder-guide.pdf"
              className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              Download full guide
            </a>
          </div>
        </div>
      </section>

      {/* Agents / roadmap */}
      <section className="bg-cream py-24">
        <div className="mx-auto max-w-[1600px] px-6 lg:px-12">
          <h2 className="max-w-3xl text-4xl leading-tight tracking-tight lg:text-5xl">
            Build a real company with the help of specialized agents
          </h2>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
            <p className="max-w-xl text-muted-foreground">
              Choose the work you want done first, then let specialized agents move it forward with
              your approvals.
            </p>
            <a
              href="https://app.cofounder.co/"
              className="rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              Start your roadmap
            </a>
          </div>

          <div className="mt-14 space-y-6">
            {features.map((f, i) => (
              <div
                key={f.heading}
                className="grid gap-8 rounded-3xl border border-border bg-card p-8 lg:grid-cols-2 lg:p-10"
              >
                <div className="flex flex-col justify-center">
                  <span className="font-pixel text-[10px] text-sky">0{i + 1}</span>
                  <h3 className="mt-4 text-2xl font-semibold tracking-tight">{f.heading}</h3>
                  <p className="mt-3 max-w-md leading-relaxed text-muted-foreground">{f.body}</p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <a
                      href="/how-to/start"
                      className="rounded-xl border border-border px-4 py-2.5 text-sm transition-colors hover:bg-secondary"
                    >
                      Learn {f.learn}
                    </a>
                    <a
                      href="https://app.cofounder.co/"
                      className="rounded-xl bg-primary px-4 py-2.5 text-sm text-primary-foreground"
                    >
                      Run this in Cofounder
                    </a>
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-secondary p-5">
                  {i === 0 ? (
                    <ul className="space-y-2">
                      {roadmap.map((r) => (
                        <li
                          key={r.title}
                          className="flex items-center justify-between rounded-xl bg-card px-4 py-3"
                        >
                          <span className="text-sm font-medium">{r.title}</span>
                          <span
                            className={`text-xs ${
                              r.kind === "Agent requires approval"
                                ? "text-sky-deep"
                                : "text-muted-foreground"
                            }`}
                          >
                            {r.kind}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : i === 1 ? (
                    <div className="space-y-3">
                      <div className="rounded-xl bg-card px-4 py-3 text-sm font-medium">
                        Landing Page
                      </div>
                      <div className="rounded-xl bg-card px-4 py-3 text-sm">
                        Engineer / Landing Page Updates
                      </div>
                      <div className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
                        Create a new task for Cofounder
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="rounded-xl bg-card px-4 py-3 text-sm font-medium">
                        Email Preview
                      </div>
                      <div className="rounded-xl bg-card px-4 py-5 text-sm text-muted-foreground">
                        Hi there — I saw you're building something new. Want an agent to run
                        outbound for you this week?
                      </div>
                      <div className="flex gap-2">
                        <span className="rounded-full bg-sky px-3 py-1.5 text-xs text-primary-foreground">
                          Approve
                        </span>
                        <span className="rounded-full border border-border px-3 py-1.5 text-xs">
                          Edit draft
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA + footer */}
      <footer className="bg-ink">
        <div className="mx-auto max-w-[1600px] px-6 py-20 lg:px-12">
          <h2 className="max-w-2xl font-display text-5xl text-primary-foreground lg:text-6xl">
            Run a company with Cofounder
          </h2>
          <a
            href="https://app.cofounder.co/"
            className="mt-8 inline-block rounded-xl bg-card px-5 py-3 text-sm font-medium text-foreground"
          >
            Run a company
          </a>

          <div className="mt-16 flex flex-wrap items-center justify-between gap-6 border-t border-primary-foreground/10 pt-8">
            <span className="font-display text-2xl text-primary-foreground">Cofounder</span>
            <div className="flex flex-wrap gap-6 text-sm text-primary-foreground/60">
              <a href="/pricing" className="hover:text-primary-foreground">
                Pricing
              </a>
              <a href="/resources" className="hover:text-primary-foreground">
                Resources
              </a>
              <a href="/how-to/start" className="hover:text-primary-foreground">
                How to start
              </a>
              <span>© 2026 Cofounder</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
