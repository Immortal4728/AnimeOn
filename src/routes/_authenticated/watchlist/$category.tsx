import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import {
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Film,
  LogOut,
  X,
  Palette,
  Check,
  Search,
  Bookmark,
} from "lucide-react";
import { onAuthStateChanged, signOut as fbSignOut } from "firebase/auth";

import { auth } from "@/lib/firebase";
import {
  THEMES,
  applyTheme,
  fetchUserTheme,
  saveUserTheme,
  getSavedTheme,
} from "@/lib/theme";
import type { WatchlistItem, WatchStatus, MediaType } from "@/lib/watchlist";
import {
  fetchUserWatchlist,
  addWatchlistItem,
  updateWatchlistItem,
  deleteWatchlistItem,
} from "@/services/watchlist";

export const Route = createFileRoute("/_authenticated/watchlist/$category")({
  head: ({ params }) => {
    const slug = params.category;
    let categoryName = "Watchlist";
    if (slug === "anime") categoryName = "Anime";
    else if (slug === "movies") categoryName = "Movies";
    else if (slug === "k-dramas") categoryName = "K-Dramas";
    else if (slug === "web-series") categoryName = "Web Series";
    else if (slug === "games") categoryName = "Games";
    else if (slug === "porn") categoryName = "Porn";

    return {
      meta: [
        { title: `${categoryName} — Anime On` },
        {
          name: "description",
          content: `Manage your ${categoryName.toLowerCase()} watchlist on Anime On.`,
        },
        { property: "og:title", content: `${categoryName} — Anime On` },
      ],
    };
  },
  component: WatchlistCategoryPage,
});

const MEDIA_FILTERS: { label: string; value: MediaType; slug: string }[] = [
  { label: "Anime", value: "anime", slug: "anime" },
  { label: "Movies", value: "movie", slug: "movies" },
  { label: "K-Dramas", value: "kdrama", slug: "k-dramas" },
  { label: "Web Series", value: "web", slug: "web-series" },
  { label: "Games", value: "game", slug: "games" },
  { label: "Porn", value: "porn", slug: "porn" },
];

const STATUS_FILTERS: { label: string; value: WatchStatus }[] = [
  { label: "Want to Watch", value: "want" },
  { label: "Completed", value: "completed" },
];

const STATUSES: WatchStatus[] = ["want", "completed"];

function mediaTypeToSlug(type: MediaType): string {
  const match = MEDIA_FILTERS.find((f) => f.value === type);
  return match ? match.slug : "anime";
}

function slugToMediaType(slug: string): MediaType {
  const match = MEDIA_FILTERS.find((f) => f.slug === slug);
  return match ? match.value : "anime";
}

function WatchlistCategoryPage() {
  const { category: categorySlug } = Route.useParams();
  const navigate = useNavigate();

  const selectedType = slugToMediaType(categorySlug);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [search, setSearch] = useState("");

  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentUid, setCurrentUid] = useState<string | null>(null);

  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [activeTheme, setActiveTheme] = useState<string>("pink");
  const themePopoverRef = useRef<HTMLDivElement>(null);

  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WatchlistItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    media_type: selectedType as MediaType,
    status: "want" as WatchStatus,
    cover_url: "",
    link: "",
    notes: "",
  });

  const [deletingItem, setDeletingItem] = useState<WatchlistItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const saved = getSavedTheme();
    setActiveTheme(saved);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUid(user.uid);
        const userTheme = await fetchUserTheme(user.uid);
        if (userTheme) {
          applyTheme(userTheme);
          setActiveTheme(userTheme);
        }
      } else {
        setCurrentUid(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        themePopoverRef.current &&
        !themePopoverRef.current.contains(e.target as Node)
      ) {
        setIsThemeOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSelectTheme(themeId: string) {
    applyTheme(themeId);
    setActiveTheme(themeId);
    setIsThemeOpen(false);

    const currentUser = auth.currentUser;
    const uid = currentUser?.uid || currentUid;

    if (!uid) {
      console.warn("[THEME] Skipping Firestore save: auth.currentUser is null");
      return;
    }

    try {
      await saveUserTheme(uid, themeId);
    } catch (err: any) {
      console.error("[THEME] Internal silent save error:", err);
    }
  }

  const handleCategoryChange = (type: MediaType) => {
    const slug = mediaTypeToSlug(type);
    setSelectedStatus("all");
    void navigate({
      to: "/watchlist/$category",
      params: { category: slug },
    });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const fetched = await fetchUserWatchlist(user.uid);
        setItems(fetched);
      } catch (err: any) {
        console.error("Failed to load watchlist:", err);
        setError("Could not load your watchlist items.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setForm({
      title: "",
      media_type: selectedType,
      status: "want",
      cover_url: "",
      link: "",
      notes: "",
    });
    setIsItemModalOpen(true);
  };

  const openEditModal = (item: WatchlistItem) => {
    setEditingItem(item);
    setForm({
      title: item.title,
      media_type: item.media_type,
      status: item.status,
      cover_url: item.cover_url || "",
      link: item.link || "",
      notes: item.notes || "",
    });
    setIsItemModalOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    const user = auth.currentUser;
    if (!user) {
      toast.error("You must be logged in.");
      return;
    }

    setSubmitting(true);
    try {
      if (editingItem) {
        await updateWatchlistItem(user.uid, editingItem.id, {
          title: form.title,
          status: form.status,
          imageUrl: form.cover_url || null,
          link: form.link || null,
          notes: form.notes || null,
        });

        setItems((prev) =>
          prev.map((i) =>
            i.id === editingItem.id
              ? {
                  ...i,
                  title: form.title,
                  status: form.status,
                  cover_url: form.cover_url || null,
                  link: form.link || null,
                  notes: form.notes || null,
                }
              : i
          )
        );
        toast.success("Item updated successfully");
      } else {
        const newItem = await addWatchlistItem(user.uid, {
          title: form.title,
          type: selectedType,
          status: form.status,
          imageUrl: form.cover_url || null,
          link: form.link || null,
          notes: form.notes || null,
        });
        setItems((prev) => [newItem, ...prev]);
        toast.success("Item added to watchlist");
      }
      setIsItemModalOpen(false);
    } catch (err: any) {
      console.error("Save error:", err);
      toast.error("Failed to save item. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;

    const user = auth.currentUser;
    if (!user) {
      toast.error("You must be logged in to delete items.");
      setDeletingItem(null);
      return;
    }

    const targetItem = deletingItem;
    setIsDeleting(true);

    try {
      await deleteWatchlistItem(user.uid, targetItem.id);
      setItems((prev) => prev.filter((i) => i.id !== targetItem.id));
      setDeletingItem(null);
      toast.success("Item deleted", {
        description: `"${targetItem.title}" was removed from your watchlist.`,
      });
    } catch (err: any) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete item", {
        description: "Please check your connection and try again.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const visibleItems = items.filter((item) => {
    if (item.media_type !== selectedType) return false;
    if (selectedStatus !== "all" && item.status !== selectedStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        (item.notes && item.notes.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const statusLabel = (st: WatchStatus, type?: MediaType) => {
    if (type === "game") {
      return st === "want" ? "Want to Play" : "Completed";
    }
    return st === "want" ? "Want to Watch" : "Completed";
  };

  const typeLabel = (t: MediaType) => {
    const match = MEDIA_FILTERS.find((f) => f.value === t);
    return match ? match.label : t;
  };

  const getAddButtonLabel = () => {
    switch (selectedType) {
      case "anime":
        return "+ Add Anime";
      case "movie":
        return "+ Add Movie";
      case "kdrama":
        return "+ Add K-Drama";
      case "web":
        return "+ Add Web Series";
      case "game":
        return "+ Add Game";
      case "porn":
        return "+ Add Link";
      default:
        return "+ Add Item";
    }
  };

  return (
    <main className="scanlines min-h-screen bg-[#07090e] text-foreground pb-24 touch-manipulation">
      {/* BACKGROUND ATMOSPHERIC GLOWS */}
      <div className="fixed top-0 left-1/4 -z-10 h-96 w-96 rounded-full bg-neon/10 blur-[150px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 -z-10 h-96 w-96 rounded-full bg-neon-2/10 blur-[150px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-12 space-y-5 sm:space-y-8 pt-3 sm:pt-6">
        {/* TOP NAVBAR HEADER */}
        <header className="sticky top-2 sm:top-4 z-40 rounded-2xl border border-border/40 bg-[#0c0e17]/80 px-3.5 sm:px-6 py-2.5 sm:py-3.5 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-neon animate-ping" />
              <span className="font-display text-sm sm:text-base font-bold uppercase tracking-[0.16em] sm:tracking-[0.2em] text-foreground drop-shadow-[0_0_15px_var(--neon)]">
                ANIME ON
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* THEMES BUTTON & POPOVER */}
              <div className="relative" ref={themePopoverRef}>
                <button
                  type="button"
                  onClick={() => setIsThemeOpen((prev) => !prev)}
                  className="inline-flex items-center justify-center gap-1.5 min-h-[40px] sm:min-h-[44px] rounded-xl border border-border/40 bg-secondary/30 px-3 sm:px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] sm:tracking-[0.18em] text-muted-foreground transition-all hover:border-border hover:bg-secondary/60 hover:text-foreground active:scale-95"
                  aria-label="Select Theme"
                  aria-expanded={isThemeOpen}
                >
                  <Palette className="h-3.5 w-3.5 shrink-0" />
                  <span className="text-xs">Themes</span>
                </button>

                {/* Theme Selector Popover */}
                {isThemeOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 max-w-[calc(100vw-2rem)] rounded-2xl border border-border/40 bg-[#0c0e17]/95 p-2 shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-xl z-50 animate-in fade-in zoom-in-95"
                    role="menu"
                  >
                    <div className="px-3 py-1.5 border-b border-border/20 mb-1 flex items-center justify-between">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                        Theme Library
                      </p>
                      <span className="text-[9px] uppercase tracking-[0.14em] text-neon font-semibold">
                        {THEMES.length} Themes
                      </span>
                    </div>
                    <div className="space-y-1 max-h-60 sm:max-h-72 overflow-y-auto pr-1 scrollbar-none">
                      {THEMES.map((t) => {
                        const isActive = activeTheme === t.id;
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => void handleSelectTheme(t.id)}
                            className={`w-full flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition-all min-h-[40px] ${
                              isActive
                                ? "bg-secondary/60 text-foreground border border-neon/40 shadow-[0_0_10px_rgba(236,72,153,0.15)]"
                                : "text-muted-foreground hover:text-foreground hover:bg-secondary/30"
                            }`}
                            role="menuitem"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {t.colorSecondaryHex ? (
                                <div className="relative h-3.5 w-3.5 shrink-0">
                                  <span
                                    className="absolute left-0 top-0 h-3 w-3 rounded-full border border-black/40 shadow-sm"
                                    style={{ backgroundColor: t.colorHex }}
                                  />
                                  <span
                                    className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border border-black/40 shadow-sm"
                                    style={{ backgroundColor: t.colorSecondaryHex }}
                                  />
                                </div>
                              ) : (
                                <span
                                  className="h-3.5 w-3.5 rounded-full border border-black/40 shadow-sm shrink-0"
                                  style={{ backgroundColor: t.colorHex }}
                                />
                              )}
                              <span className="truncate">{t.name}</span>
                            </div>
                            {isActive && <Check className="h-3.5 w-3.5 text-neon shrink-0 ml-1" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="inline-flex items-center justify-center gap-1.5 min-h-[40px] sm:min-h-[44px] rounded-xl border border-border/40 bg-secondary/30 px-3 sm:px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] sm:tracking-[0.18em] text-muted-foreground transition-all hover:border-border hover:bg-secondary/60 hover:text-foreground active:scale-95"
              >
                <LogOut className="h-3.5 w-3.5 shrink-0" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* CONTROLS HEADER & SEARCH AREA */}
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col gap-3.5 md:flex-row md:items-end md:justify-between">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-neon/40 bg-neon/10 px-3 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-neon shadow-[0_0_15px_rgba(236,72,153,0.2)]">
                <Sparkles className="h-3 w-3 shrink-0 animate-pulse" />
                <span>PERSONAL ARCHIVE</span>
              </div>
              <h1 className="font-display text-2xl sm:text-4xl font-bold uppercase tracking-[0.14em] sm:tracking-[0.16em] text-foreground truncate max-w-full">
                MY WATCHLIST
              </h1>
              <p className="text-xs text-muted-foreground tracking-[0.1em]">
                Everything you want to come back to.
              </p>
            </div>

            {/* Search Input Bar */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search archive..."
                className="w-full rounded-xl border border-border/60 bg-secondary/50 pl-10 pr-4 py-2.5 text-base sm:text-xs text-foreground outline-none transition placeholder:text-muted-foreground focus:border-neon focus:ring-1 focus:ring-neon min-h-[44px]"
              />
            </div>
          </div>

          {/* LEVEL 1: PRIMARY MEDIA TYPE NAVIGATION — Touch swipeable with edge scroll */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-border/20 max-w-full -mx-3.5 px-3.5 sm:mx-0 sm:px-0 snap-x touch-pan-x">
            {MEDIA_FILTERS.map((f) => {
              const isActive = selectedType === f.value;
              return (
                <button
                  key={f.value}
                  onClick={() => handleCategoryChange(f.value)}
                  className={`shrink-0 snap-start min-h-[42px] sm:min-h-[44px] rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] sm:tracking-[0.2em] transition-all duration-200 active:scale-95 ${
                    isActive
                      ? "border border-neon/60 bg-primary/20 text-foreground shadow-[0_0_20px_rgba(236,72,153,0.25)]"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          {/* LEVEL 2: STATUS FILTER & TOOLBAR CONTAINER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card/40 rounded-2xl border border-border/40 p-3 sm:px-5 sm:py-3 backdrop-blur-xl shadow-lg">
            {/* STATUS FILTER STRIP */}
            {["anime", "movie", "kdrama", "web"].includes(selectedType) ? (
              <div className="inline-flex items-center gap-1.5 bg-[#0c0e17]/80 border border-border/40 p-1.5 rounded-xl max-w-full overflow-x-auto scrollbar-none snap-x touch-pan-x">
                {STATUS_FILTERS.map((s) => {
                  const isActive = selectedStatus === s.value;
                  return (
                    <button
                      key={s.value}
                      onClick={() => setSelectedStatus(isActive ? "all" : s.value)}
                      className={`shrink-0 snap-start min-h-[38px] rounded-lg px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.14em] sm:tracking-[0.16em] transition-all duration-200 active:scale-95 ${
                        isActive
                          ? "border border-neon/60 bg-neon/15 text-neon shadow-[0_0_15px_rgba(236,72,153,0.3)]"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                      }`}
                    >
                      {statusLabel(s.value, selectedType)}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div />
            )}

            {/* CONTEXTUAL ADD BUTTON */}
            <button
              onClick={openAddModal}
              className="w-full sm:w-auto shrink-0 min-h-[46px] inline-flex items-center justify-center gap-2 rounded-xl border border-neon/60 bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-primary-foreground shadow-[0_0_25px_-5px_var(--neon)] transition-all hover:scale-[1.02] hover:bg-primary/90 active:scale-[0.98] sm:ml-auto"
            >
              <Plus className="h-4 w-4 shrink-0" />
              {getAddButtonLabel()}
            </button>
          </div>
        </div>

        {/* MEDIA CONTENT GRID AREA */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-neon border-t-transparent mx-auto" />
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Opening your shelf…</p>
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-destructive/40 bg-destructive/10 py-16 px-6 text-center space-y-4 backdrop-blur-sm">
            <h3 className="font-display text-xl font-bold uppercase tracking-[0.16em] text-destructive">
              {error}
            </h3>
            <p className="text-xs text-muted-foreground tracking-[0.1em]">
              Please check your connection or retry logging in.
            </p>
          </div>
        ) : visibleItems.length === 0 ? (
          /* EMPTY STATE */
          <div className="rounded-3xl border border-border/30 bg-card/20 py-14 sm:py-20 px-4 sm:px-6 text-center space-y-6 backdrop-blur-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-neon/30 bg-neon/10 text-neon shadow-[0_0_30px_rgba(236,72,153,0.2)]">
              <Bookmark className="h-8 w-8" />
            </div>

            {selectedStatus !== "all" ? (
              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-[0.18em] text-foreground">
                  NO ITEMS MATCH THIS FILTER
                </h3>
                <p className="text-xs text-muted-foreground tracking-[0.1em]">
                  Try selecting another filter or search term.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-[0.18em] text-foreground">
                  YOUR SHELF IS EMPTY
                </h3>
                <p className="text-xs text-muted-foreground tracking-[0.1em]">
                  Start saving the things you want to remember.
                </p>
              </div>
            )}

            <div>
              <button
                onClick={openAddModal}
                className="inline-flex items-center justify-center gap-2 min-h-[46px] rounded-xl border border-neon/60 bg-primary px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground shadow-[0_0_25px_var(--neon)] transition-all active:scale-95"
              >
                <Plus className="h-4 w-4" />
                {getAddButtonLabel()}
              </button>
            </div>
          </div>
        ) : (
          /* MEDIA CARDS LIST — Premium retro anime VHS archive cases */
          <ul className="grid gap-4 sm:gap-5 grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {visibleItems.map((item) => (
              <li
                key={item.id}
                className="group relative overflow-hidden rounded-2xl border border-border/40 bg-[#0c0e17]/90 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-neon/80 hover:shadow-[0_0_25px_var(--neon)] flex flex-col justify-between"
              >
                {/* 1. Large Artwork Area */}
                <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#07090e] rounded-t-2xl">
                  {item.cover_url ? (
                    <img
                      src={item.cover_url}
                      alt={item.title}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                      className="h-full w-full object-cover transition-all duration-500 group-hover:scale-[1.04] group-hover:brightness-110 group-hover:drop-shadow-[2px_0_0_rgba(236,72,153,0.4)]"
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground p-4 text-center">
                      <Film className="h-8 w-8 opacity-40 text-neon" />
                      <span className="text-[10px] uppercase tracking-[0.2em] font-mono">No cover</span>
                    </div>
                  )}

                  {/* Gradient Overlay Fade toward Info Section */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e17] via-[#0c0e17]/25 to-transparent pointer-events-none" />

                  {/* CRT Scanline & Subtle Vignette Overlay */}
                  <div className="absolute inset-0 scanlines opacity-25 pointer-events-none" />
                  <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] pointer-events-none" />

                  {/* 2. Retro Status Badge */}
                  {item.media_type !== "porn" && item.media_type !== "game" && (
                    <div className="absolute top-2.5 left-2.5 z-10">
                      <span className="inline-flex items-center gap-1.5 rounded-md border border-neon/60 bg-[#07090e]/90 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-neon backdrop-blur-md shadow-[0_0_14px_var(--neon)]">
                        <span className="h-1.5 w-1.5 rounded-full bg-neon animate-pulse shrink-0" />
                        {statusLabel(item.status, item.media_type)}
                      </span>
                    </div>
                  )}
                </div>

                {/* 3. Card Information Section & Action Buttons */}
                <div className="p-3.5 space-y-2.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-display text-sm font-bold uppercase tracking-[0.14em] text-foreground line-clamp-1 group-hover:text-neon transition-colors drop-shadow-[0_0_12px_var(--neon)]">
                      {item.title}
                    </h3>
                    {item.media_type !== "porn" && item.media_type !== "game" && (
                      <p className="mt-0.5 text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground/80">
                        {typeLabel(item.media_type)}
                      </p>
                    )}
                  </div>

                  {/* 4. Action Controls Area */}
                  <div className="space-y-2 pt-0.5">
                    {item.media_type === "porn" && item.link ? (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full min-h-[36px] flex items-center justify-center gap-1.5 rounded-xl border border-neon/60 bg-neon/10 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-neon hover:bg-neon/20 transition-all shadow-[0_0_12px_var(--neon)] mb-1 active:scale-95"
                      >
                        <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                        Open Link
                      </a>
                    ) : null}

                    {/* Compact Action Buttons */}
                    <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em]">
                      <button
                        onClick={() => openEditModal(item)}
                        className="flex-1 min-h-[36px] sm:min-h-[38px] rounded-xl border border-border/60 bg-secondary/40 hover:border-neon/70 hover:bg-neon/15 hover:text-neon text-foreground text-[11px] font-bold uppercase tracking-[0.16em] transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-sm"
                      >
                        <Edit2 className="h-3.5 w-3.5 shrink-0" />
                        Edit
                      </button>
                      <button
                        onClick={() => setDeletingItem(item)}
                        className="flex-1 min-h-[36px] sm:min-h-[38px] rounded-xl border border-border/40 bg-destructive/10 hover:border-destructive/60 hover:bg-destructive/25 text-destructive/90 hover:text-destructive text-[11px] font-bold uppercase tracking-[0.16em] transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-sm"
                      >
                        <Trash2 className="h-3.5 w-3.5 shrink-0" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ADD / EDIT ITEM MODAL — Mobile sheet slide-up / Centered modal */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 p-0 sm:p-6 backdrop-blur-md overflow-y-auto">
          <form
            onSubmit={handleSaveItem}
            className="w-full max-w-lg space-y-4 rounded-t-3xl sm:rounded-2xl border border-border/40 bg-[#0c0e17] p-5 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-5 sm:animate-none"
          >
            <div className="flex items-center justify-between border-b border-border/20 pb-3.5">
              <h2 className="font-display text-base sm:text-lg font-bold uppercase tracking-[0.18em] text-foreground truncate pr-2">
                {editingItem ? "EDIT ITEM" : "ADD TO WATCHLIST"}
              </h2>
              <button
                type="button"
                onClick={() => setIsItemModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg active:scale-90"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  Title
                </label>
                <input
                  required
                  autoFocus
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Title"
                  className="w-full rounded-xl border border-border/60 bg-secondary/50 px-3.5 sm:px-4 py-3 text-base sm:text-sm text-foreground outline-none focus:border-neon focus:ring-1 focus:ring-neon min-h-[44px]"
                />
              </div>

              {/* Cover / Banner URL */}
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  Cover / Banner URL
                </label>
                <input
                  value={form.cover_url}
                  onChange={(e) => setForm({ ...form, cover_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-border/60 bg-secondary/50 px-3.5 sm:px-4 py-3 text-base sm:text-sm text-foreground outline-none focus:border-neon focus:ring-1 focus:ring-neon truncate min-h-[44px]"
                />
              </div>

              {/* FOR PORN CATEGORY: LINK FIELD ONLY */}
              {form.media_type === "porn" ? (
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                    Link
                  </label>
                  <input
                    value={form.link}
                    onChange={(e) => setForm({ ...form, link: e.target.value })}
                    placeholder="https://..."
                    className="w-full rounded-xl border border-border/60 bg-secondary/50 px-3.5 sm:px-4 py-3 text-base sm:text-sm text-foreground outline-none focus:border-neon focus:ring-1 focus:ring-neon truncate min-h-[44px]"
                  />
                </div>
              ) : form.media_type === "game" ? (
                null
              ) : (
                <>
                  {/* Status */}
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                      Status
                    </label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value as WatchStatus })}
                      className="w-full rounded-xl border border-border/60 bg-secondary/50 px-3.5 sm:px-4 py-3 text-base sm:text-sm text-foreground outline-none focus:border-neon min-h-[44px]"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {statusLabel(s, form.media_type)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                      Notes (optional)
                    </label>
                    <textarea
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      placeholder="Personal thoughts, episode progress..."
                      rows={3}
                      className="w-full rounded-xl border border-border/60 bg-secondary/50 px-3.5 sm:px-4 py-3 text-base sm:text-sm text-foreground outline-none focus:border-neon focus:ring-1 focus:ring-neon"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 text-xs uppercase tracking-[0.18em] pt-4 border-t border-border/20">
              <button
                type="button"
                onClick={() => setIsItemModalOpen(false)}
                className="flex-1 sm:flex-none min-h-[46px] px-4 py-2.5 text-muted-foreground hover:text-foreground flex items-center justify-center rounded-xl bg-secondary/30 active:scale-95"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 sm:flex-none min-h-[46px] rounded-xl border border-neon/60 bg-primary px-6 py-2.5 font-bold text-primary-foreground shadow-[0_0_25px_var(--neon)] hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center active:scale-95"
              >
                {submitting ? "SAVING…" : "SAVE"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* LOGOUT CONFIRMATION MODAL */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-sm space-y-6 rounded-2xl border border-border/40 bg-[#0c0e17] p-6 text-center shadow-2xl">
            <div className="space-y-2">
              <h3 className="font-display text-xl font-bold uppercase tracking-[0.16em] text-foreground">
                LOGOUT CONFIRMATION
              </h3>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Are you sure you want to sign out of Anime On?
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 min-h-[44px] rounded-xl border border-border/50 bg-secondary/30 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground hover:bg-secondary/60 transition-colors flex items-center justify-center active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  void fbSignOut(auth);
                }}
                className="flex-1 min-h-[44px] rounded-xl border border-destructive/60 bg-destructive/20 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-destructive hover:bg-destructive/30 transition-colors flex items-center justify-center active:scale-95"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE ITEM CONFIRMATION MODAL */}
      {deletingItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
          onClick={() => !isDeleting && setDeletingItem(null)}
        >
          <div
            className="w-full max-w-md space-y-6 rounded-2xl border border-destructive/40 bg-[#0c0e17] p-6 sm:p-8 shadow-[0_0_40px_rgba(239,68,68,0.2)] transition-all animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border/20 pb-4">
              <h2 className="font-display text-lg font-bold uppercase tracking-[0.18em] text-foreground truncate pr-2">
                DELETE ITEM
              </h2>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingItem(null)}
                className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground leading-relaxed">
                Are you sure you want to delete <span className="font-bold text-foreground">"{deletingItem.title}"</span>?
              </p>
              <p className="text-[11px] text-destructive/80 tracking-[0.12em] uppercase">
                This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 text-xs uppercase tracking-[0.18em] pt-4 border-t border-border/20">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingItem(null)}
                className="flex-1 sm:flex-none min-h-[44px] rounded-xl border border-border/50 bg-secondary/30 px-5 py-2.5 font-semibold text-muted-foreground hover:bg-secondary/60 hover:text-foreground transition-colors disabled:opacity-50 flex items-center justify-center active:scale-95"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => void handleConfirmDelete()}
                className="flex-1 sm:flex-none min-h-[44px] rounded-xl border border-destructive/60 bg-destructive/20 px-6 py-2.5 font-bold text-destructive shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:bg-destructive/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
              >
                {isDeleting ? (
                  <>
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-destructive border-t-transparent" />
                    DELETING…
                  </>
                ) : (
                  "DELETE"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
