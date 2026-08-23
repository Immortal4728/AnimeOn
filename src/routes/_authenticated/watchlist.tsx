import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, useRef } from "react";
import { toast } from "sonner";
import {
  LogOut,
  Plus,
  Search,
  Sparkles,
  Edit2,
  Trash2,
  Bookmark,
  Film,
  X,
  ExternalLink,
} from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";

import { supabase } from "@/integrations/supabase/client";
import { auth } from "@/lib/firebase";
import { recordUserProfile } from "@/lib/user-registry";
import {
  MEDIA_FILTERS,
  STATUSES,
  STATUS_FILTERS,
  statusLabel,
  typeLabel,
  type MediaType,
  type WatchStatus,
  type WatchlistItem,
} from "@/lib/watchlist";
import {
  fetchUserWatchlist,
  addWatchlistItem,
  updateWatchlistItem,
  deleteWatchlistItem,
  type CreateWatchlistItemInput,
} from "@/services/watchlist";

export const Route = createFileRoute("/_authenticated/watchlist")({
  head: () => ({
    meta: [
      { title: "My Watchlist — Anime On" },
      { name: "description", content: "Your personal shelf of things to watch and play on Anime On." },
      { property: "og:title", content: "My Watchlist — Anime On" },
    ],
  }),
  component: WatchlistPage,
});

const emptyForm = {
  title: "",
  cover_url: "",
  link: "",
  media_type: "anime" as MediaType,
  language: "",
  status: "want" as WatchStatus,
  notes: "",
};

function WatchlistPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUid, setCurrentUid] = useState<string | null>(null);

  // Loaded UID tracking for deduplication
  const loadedUidRef = useRef<string | null>(null);

  // Navigation & Filter State: Top-level default is ANIME
  const [selectedType, setSelectedType] = useState<MediaType>("anime");
  const [selectedStatus, setSelectedStatus] = useState<"all" | WatchStatus>("all");
  const [search, setSearch] = useState("");

  // Modals State
  const [editingItem, setEditingItem] = useState<WatchlistItem | null>(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Optimized Auth Resolution & Asynchronous Firestore Fetching
  useEffect(() => {
    let isSubscribed = true;

    async function loadDataForUid(uid: string) {
      if (loadedUidRef.current === uid) return;
      loadedUidRef.current = uid;
      setCurrentUid(uid);

      try {
        const loadedItems = await fetchUserWatchlist(uid);
        if (isSubscribed) {
          setItems(loadedItems);
        }
      } catch (err) {
        console.error("Failed to load user archive:", err);
        if (isSubscribed) toast.error("Could not load your archive");
      } finally {
        if (isSubscribed) setLoading(false);
      }
    }

    const immediateUser = auth.currentUser;
    if (immediateUser) {
      recordUserProfile({
        id: immediateUser.uid,
        email: immediateUser.email ?? null,
        created_at: immediateUser.metadata.creationTime
          ? new Date(immediateUser.metadata.creationTime).toISOString()
          : undefined,
      });
      void loadDataForUid(immediateUser.uid);
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        recordUserProfile({
          id: fbUser.uid,
          email: fbUser.email ?? null,
          created_at: fbUser.metadata.creationTime
            ? new Date(fbUser.metadata.creationTime).toISOString()
            : undefined,
        });
        await loadDataForUid(fbUser.uid);
      } else {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.user) {
          await loadDataForUid(sessionData.session.user.id);
        } else if (!auth.currentUser) {
          if (isSubscribed) setLoading(false);
        }
      }
    });

    return () => {
      isSubscribed = false;
      unsubscribe();
    };
  }, []);

  // Filter Items based on Type, Status, and Search Query
  const visibleItems = useMemo(() => {
    const q = search.trim().toLowerCase();

    return items.filter((item) => {
      // 1. Media Type Filter (Strict)
      if (item.media_type !== selectedType) {
        return false;
      }

      // 2. Status Filter (Applied to anime, movie, kdrama, web)
      if (["anime", "movie", "kdrama", "web"].includes(selectedType)) {
        if (selectedStatus !== "all" && item.status !== selectedStatus) {
          return false;
        }
      }

      // 3. Search Query Filter
      if (q !== "") {
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchNotes = item.notes?.toLowerCase().includes(q) ?? false;
        const matchLang = item.language?.toLowerCase().includes(q) ?? false;
        const matchLink = item.link?.toLowerCase().includes(q) ?? false;
        if (!matchTitle && !matchNotes && !matchLang && !matchLink) return false;
      }

      return true;
    });
  }, [items, selectedType, selectedStatus, search]);

  // Contextual Add Button Label
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
        return "+ Add Porn";
      default:
        return "+ Add Item";
    }
  };

  // Open Add Item Modal pre-populated with current context
  function openAddModal() {
    setEditingItem(null);
    const initialStatus = selectedStatus !== "all" ? selectedStatus : "want";

    setForm({
      ...emptyForm,
      media_type: selectedType,
      status: initialStatus,
    });
    setIsItemModalOpen(true);
  }

  // Open Edit Item Modal
  function openEditModal(item: WatchlistItem) {
    setEditingItem(item);
    setForm({
      title: item.title,
      cover_url: item.cover_url ?? "",
      link: item.link ?? "",
      media_type: item.media_type,
      language: item.language ?? "",
      status: item.status,
      notes: item.notes ?? "",
    });
    setIsItemModalOpen(true);
  }

  // Save Item (Create or Edit) with robust error handling and submit lock
  async function handleSaveItem(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    const fbUser = auth.currentUser;
    const uid = fbUser?.uid || currentUid;

    if (!uid) {
      console.error("[Save Failed] No authenticated Firebase user UID found.");
      toast.error("Please sign in with Google to save items.");
      setIsItemModalOpen(false);
      navigate({ to: "/login" });
      return;
    }

    const isPorn = form.media_type === "porn";
    const isGame = form.media_type === "game";

    const payload: CreateWatchlistItemInput = {
      title: form.title.trim(),
      imageUrl: form.cover_url.trim() || null,
      link: isPorn ? form.link.trim() || null : null,
      type: form.media_type,
      shelfId: null,
      shelfName: null,
      language: isPorn || isGame ? null : form.language.trim() || null,
      status: form.status,
      notes: isPorn || isGame ? null : form.notes.trim() || null,
    };

    setSubmitting(true);

    try {
      if (editingItem) {
        console.log(`[Firestore Update] Updating document ${editingItem.id} for UID ${uid}...`, payload);
        await updateWatchlistItem(uid, editingItem.id, payload);
        setItems((prev) =>
          prev.map((i) =>
            i.id === editingItem.id
              ? {
                  ...i,
                  title: payload.title,
                  cover_url: payload.imageUrl,
                  link: payload.link || null,
                  media_type: payload.type,
                  language: payload.language || null,
                  status: payload.status,
                  notes: payload.notes || null,
                }
              : i
          )
        );
        toast.success("Watchlist item updated");
      } else {
        console.log(`[Firestore Add] Creating new document in users/${uid}/watchlist...`, payload);
        const newItem = await addWatchlistItem(uid, payload);
        console.log("[Firestore Add Success] Document created:", newItem);
        setItems((prev) => [newItem, ...prev]);
        toast.success("Added to your watchlist");
      }
      setIsItemModalOpen(false);
    } catch (err: any) {
      console.error("[Firestore Save Failure]:", err);
      toast.error(`Save failed: ${err?.message || "Firestore permission or write error"}`);
    } finally {
      setSubmitting(false);
    }
  }

  // Update Status directly from Card
  async function handleStatusChange(item: WatchlistItem, status: WatchStatus) {
    const fbUser = auth.currentUser;
    const uid = fbUser?.uid || currentUid;
    if (!uid) return;

    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status } : i)));

    try {
      await updateWatchlistItem(uid, item.id, { status });
    } catch (err) {
      console.error("Status update error:", err);
      toast.error("Could not update status");
    }
  }

  // Delete Item
  async function handleDeleteItem(item: WatchlistItem) {
    if (!confirm(`Delete "${item.title}" from your archive?`)) return;

    const fbUser = auth.currentUser;
    const uid = fbUser?.uid || currentUid;
    if (!uid) return;

    setItems((prev) => prev.filter((i) => i.id !== item.id));

    try {
      await deleteWatchlistItem(uid, item.id);
      toast.success("Item removed");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Could not delete item");
    }
  }

  async function signOut() {
    await auth.signOut();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  return (
    <main className="scanlines min-h-screen bg-[#07090e] text-foreground px-4 sm:px-6 py-6 sm:py-10 lg:px-12">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* STICKY GLASS NAVBAR HEADER — Renders immediately */}
        <header className="sticky top-2 sm:top-4 z-40 rounded-2xl border border-border/40 bg-card/60 px-4 sm:px-6 py-3.5 sm:py-4 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <a
                href="/"
                className="font-display text-base sm:text-lg uppercase tracking-[0.2em] text-foreground drop-shadow-[0_0_15px_var(--neon)] transition-opacity hover:opacity-90 flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4 text-neon animate-pulse" />
                ANIME ON
              </a>
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-neon/40 bg-neon/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-neon">
                <span className="h-1.5 w-1.5 rounded-full bg-neon animate-ping" />
                PERSONAL SHELF
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em]">
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="flex items-center gap-2 rounded-lg border border-border/60 bg-secondary/40 px-3.5 py-2 text-xs font-semibold text-muted-foreground transition-all duration-200 hover:border-destructive/60 hover:bg-destructive/10 hover:text-destructive hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </header>

        {/* EDITORIAL LIBRARY HEADER & NAVIGATION — Renders immediately */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/20 pb-6">
            <div>
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.35em] text-neon">
                YOUR ARCHIVE
              </span>
              <h1 className="mt-1 font-display text-3xl sm:text-5xl font-extrabold uppercase tracking-[0.16em] text-foreground drop-shadow-[0_0_30px_var(--neon)]">
                WATCHLIST
              </h1>
              <p className="mt-1.5 text-xs text-muted-foreground tracking-[0.1em]">
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
                className="w-full rounded-xl border border-border/60 bg-secondary/50 pl-10 pr-4 py-2 text-xs text-foreground outline-none transition placeholder:text-muted-foreground focus:border-neon focus:ring-1 focus:ring-neon"
              />
            </div>
          </div>

          {/* LEVEL 1: PRIMARY MEDIA TYPE NAVIGATION */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-border/20">
            {MEDIA_FILTERS.map((f) => {
              const isActive = selectedType === f.value;
              return (
                <button
                  key={f.value}
                  onClick={() => {
                    setSelectedType(f.value);
                    setSelectedStatus("all");
                  }}
                  className={`shrink-0 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] transition-all duration-200 ${
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
          <div className="flex items-center justify-between gap-4 bg-card/30 rounded-2xl border border-border/30 p-3 sm:p-4 backdrop-blur-md">
            {/* STATUS FILTER STRIP (Anime, Movies, K-Dramas, Web Series: ALL, WANT TO WATCH, COMPLETED) */}
            {["anime", "movie", "kdrama", "web"].includes(selectedType) ? (
              <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-none">
                {STATUS_FILTERS.map((s) => {
                  const isActive = selectedStatus === s.value;
                  return (
                    <button
                      key={s.value}
                      onClick={() => setSelectedStatus(s.value)}
                      className={`shrink-0 rounded-lg px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] transition-all ${
                        isActive
                          ? "border border-neon bg-neon/10 text-neon shadow-[0_0_12px_rgba(236,72,153,0.3)]"
                          : "border border-border/40 bg-secondary/20 text-muted-foreground hover:text-foreground hover:border-border"
                      }`}
                    >
                      {s.label}
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
              className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 rounded-xl border border-neon/60 bg-primary px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-primary-foreground shadow-[0_0_25px_-5px_var(--neon)] transition-all hover:scale-[1.02] hover:bg-primary/90 active:scale-95 ml-auto"
            >
              <Plus className="h-4 w-4" />
              {getAddButtonLabel()}
            </button>
          </div>
        </div>

        {/* MEDIA CONTENT GRID AREA — Only content grid shows loading spinner */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-neon border-t-transparent mx-auto" />
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Opening your shelf…</p>
          </div>
        ) : visibleItems.length === 0 ? (
          /* EMPTY STATE */
          <div className="rounded-3xl border border-border/30 bg-card/20 py-20 px-6 text-center space-y-6 backdrop-blur-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-neon/30 bg-neon/10 text-neon shadow-[0_0_30px_rgba(236,72,153,0.2)]">
              <Bookmark className="h-8 w-8" />
            </div>

            {selectedStatus !== "all" ? (
              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="font-display text-2xl font-bold uppercase tracking-[0.18em] text-foreground">
                  NO ITEMS MATCH THIS FILTER
                </h3>
                <p className="text-xs text-muted-foreground tracking-[0.1em]">
                  Try selecting "ALL" or adding a new title.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="font-display text-2xl font-bold uppercase tracking-[0.18em] text-foreground">
                  YOUR ARCHIVE IS WAITING
                </h3>
                <p className="text-xs text-muted-foreground tracking-[0.1em]">
                  Start saving the things you want to remember.
                </p>
              </div>
            )}

            <div>
              <button
                onClick={openAddModal}
                className="inline-flex items-center gap-2 rounded-xl border border-neon/60 bg-primary px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground shadow-[0_0_25px_var(--neon)] transition-all hover:scale-105"
              >
                <Plus className="h-4 w-4" />
                {getAddButtonLabel()}
              </button>
            </div>
          </div>
        ) : (
          /* MEDIA CARDS LIST */
          <ul className="grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {visibleItems.map((item) => (
              <li
                key={item.id}
                className="group relative overflow-hidden rounded-2xl border border-border/40 bg-card/40 backdrop-blur-md transition-all duration-300 hover:border-neon/60 hover:shadow-[0_0_30px_rgba(236,72,153,0.2)] flex flex-col justify-between"
              >
                {/* Cover Image Container */}
                <div className="relative aspect-[2/3] w-full overflow-hidden bg-secondary/50">
                  {item.cover_url ? (
                    <img
                      src={item.cover_url}
                      alt={item.title}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 group-hover:brightness-110"
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground p-4 text-center">
                      <Film className="h-8 w-8 opacity-40" />
                      <span className="text-[10px] uppercase tracking-[0.2em]">No cover</span>
                    </div>
                  )}

                  {/* Status Badge (Only for non-porn and non-game items) */}
                  {item.media_type !== "porn" && item.media_type !== "game" && (
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center rounded-full border border-black/40 bg-black/75 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-neon backdrop-blur-md shadow-lg">
                        {statusLabel(item.status, item.media_type)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Information & Actions */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-display text-sm font-bold uppercase tracking-[0.12em] text-foreground line-clamp-1 group-hover:text-neon transition-colors">
                      {item.title}
                    </h3>
                    {item.media_type !== "porn" && item.media_type !== "game" && (
                      <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                        {typeLabel(item.media_type)}
                        {item.language ? ` · ${item.language}` : ""}
                      </p>
                    )}
                  </div>

                  {/* Status Select / External Link & Card Controls */}
                  <div className="space-y-2 pt-1 border-t border-border/20">
                    {item.media_type === "porn" ? (
                      item.link ? (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-neon/50 bg-neon/10 px-2 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-neon hover:bg-neon/20 transition-all shadow-[0_0_10px_rgba(236,72,153,0.2)]"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Open Link
                        </a>
                      ) : null
                    ) : item.media_type === "game" ? null : (
                      <select
                        value={item.status}
                        onChange={(e) => handleStatusChange(item, e.target.value as WatchStatus)}
                        className="w-full rounded-lg border border-border/50 bg-secondary/50 px-2 py-1.5 text-[11px] text-foreground outline-none transition hover:border-neon focus:border-neon"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {statusLabel(s, item.media_type)}
                          </option>
                        ))}
                      </select>
                    )}

                    <div className="flex items-center justify-between pt-1 text-[11px] uppercase tracking-[0.16em]">
                      <button
                        onClick={() => openEditModal(item)}
                        className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                      >
                        <Edit2 className="h-3 w-3" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item)}
                        className="text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="h-3 w-3" />
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

      {/* ADD / EDIT ITEM MODAL */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md overflow-y-auto">
          <form
            onSubmit={handleSaveItem}
            className="w-full max-w-lg space-y-4 rounded-2xl border border-border/40 bg-[#0c0e17] p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-border/20 pb-4">
              <h2 className="font-display text-lg font-bold uppercase tracking-[0.18em] text-foreground">
                {editingItem ? "EDIT ITEM" : "ADD TO WATCHLIST"}
              </h2>
              <button
                type="button"
                onClick={() => setIsItemModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
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
                  className="w-full rounded-xl border border-border/60 bg-secondary/50 px-4 py-2.5 text-sm text-foreground outline-none focus:border-neon focus:ring-1 focus:ring-neon"
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
                  className="w-full rounded-xl border border-border/60 bg-secondary/50 px-4 py-2.5 text-sm text-foreground outline-none focus:border-neon focus:ring-1 focus:ring-neon"
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
                    className="w-full rounded-xl border border-border/60 bg-secondary/50 px-4 py-2.5 text-sm text-foreground outline-none focus:border-neon focus:ring-1 focus:ring-neon"
                  />
                </div>
              ) : form.media_type === "game" ? (
                /* GAME CATEGORY: ONLY TITLE & COVER URL */
                null
              ) : (
                <>
                  {/* Language & Status */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                        Language (optional)
                      </label>
                      <input
                        value={form.language}
                        onChange={(e) => setForm({ ...form, language: e.target.value })}
                        placeholder="Japanese, Korean, English..."
                        className="w-full rounded-xl border border-border/60 bg-secondary/50 px-4 py-2.5 text-sm text-foreground outline-none focus:border-neon focus:ring-1 focus:ring-neon"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                        Status
                      </label>
                      <select
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value as WatchStatus })}
                        className="w-full rounded-xl border border-border/60 bg-secondary/50 px-4 py-2.5 text-sm text-foreground outline-none focus:border-neon"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {statusLabel(s, form.media_type)}
                          </option>
                        ))}
                      </select>
                    </div>
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
                      className="w-full rounded-xl border border-border/60 bg-secondary/50 px-4 py-2.5 text-sm text-foreground outline-none focus:border-neon focus:ring-1 focus:ring-neon"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end gap-3 text-xs uppercase tracking-[0.18em] pt-4 border-t border-border/20">
              <button
                type="button"
                onClick={() => setIsItemModalOpen(false)}
                className="px-4 py-2 text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl border border-neon/60 bg-primary px-6 py-2.5 font-bold text-primary-foreground shadow-[0_0_25px_var(--neon)] hover:bg-primary/90 disabled:opacity-50"
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
                className="flex-1 rounded-xl border border-border/50 bg-secondary/30 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground hover:bg-secondary/60 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  void signOut();
                }}
                className="flex-1 rounded-xl border border-destructive/60 bg-destructive/20 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-destructive hover:bg-destructive/30 transition-colors"
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
