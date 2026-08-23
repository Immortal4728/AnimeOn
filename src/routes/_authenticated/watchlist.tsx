import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import {
  FILTERS,
  MEDIA_TYPES,
  STATUSES,
  statusLabel,
  typeLabel,
  type MediaType,
  type WatchStatus,
  type WatchlistItem,
} from "@/lib/watchlist";

export const Route = createFileRoute("/_authenticated/watchlist")({
  head: () => ({
    meta: [
      { title: "My Watchlist" },
      { name: "description", content: "Your personal list of things to watch and play." },
      { property: "og:title", content: "My Watchlist" },
      { property: "og:description", content: "Your personal list of things to watch and play." },
    ],
  }),
  component: WatchlistPage,
});

const emptyForm = {
  title: "",
  cover_url: "",
  media_type: "movie" as MediaType,
  language: "",
  status: "want" as WatchStatus,
  notes: "",
};

function WatchlistPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [editing, setEditing] = useState<WatchlistItem | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    void (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return;

      await supabase
        .from("profiles")
        .upsert({ id: user.id, email: user.email ?? null }, { onConflict: "id" });

      const [{ data: rows, error }, { data: roles }] = await Promise.all([
        supabase.from("watchlist_items").select("*").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("role").eq("role", "admin"),
      ]);

      if (error) toast.error("Could not load your watchlist");
      setItems((rows ?? []) as WatchlistItem[]);
      setIsAdmin((roles ?? []).length > 0);
      setLoading(false);
    })();
  }, []);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter(
      (i) =>
        (filter === "all" || i.media_type === filter) &&
        (q === "" || i.title.toLowerCase().includes(q)),
    );
  }, [items, filter, search]);

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(item: WatchlistItem) {
    setEditing(item);
    setForm({
      title: item.title,
      cover_url: item.cover_url ?? "",
      media_type: item.media_type,
      language: item.language ?? "",
      status: item.status,
      notes: item.notes ?? "",
    });
    setOpen(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) return;

    const payload = {
      title: form.title.trim(),
      cover_url: form.cover_url.trim() || null,
      media_type: form.media_type,
      language: form.language.trim() || null,
      status: form.status,
      notes: form.notes.trim() || null,
    };

    if (editing) {
      const { data, error } = await supabase
        .from("watchlist_items")
        .update(payload)
        .eq("id", editing.id)
        .select()
        .single();
      if (error || !data) return toast.error("Could not save changes");
      setItems((prev) => prev.map((i) => (i.id === data.id ? (data as WatchlistItem) : i)));
    } else {
      const { data, error } = await supabase
        .from("watchlist_items")
        .insert({ ...payload, user_id: user.id })
        .select()
        .single();
      if (error || !data) return toast.error("Could not add item");
      setItems((prev) => [data as WatchlistItem, ...prev]);
    }
    setOpen(false);
  }

  async function changeStatus(item: WatchlistItem, status: WatchStatus) {
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status } : i)));
    const { error } = await supabase.from("watchlist_items").update({ status }).eq("id", item.id);
    if (error) toast.error("Could not update status");
  }

  async function remove(item: WatchlistItem) {
    if (!confirm(`Delete "${item.title}"?`)) return;
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    const { error } = await supabase.from("watchlist_items").delete().eq("id", item.id);
    if (error) toast.error("Could not delete item");
  }

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  return (
    <main className="min-h-screen px-6 py-10 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-display text-3xl uppercase tracking-[0.18em] drop-shadow-[0_0_20px_var(--neon)]">
            My Watchlist
          </h1>
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em]">
            {isAdmin && (
              <a href="/admin" className="text-muted-foreground hover:text-foreground">
                Admin
              </a>
            )}
            <button onClick={signOut} className="text-muted-foreground hover:text-foreground">
              Sign out
            </button>
          </div>
        </header>

        <div className="mt-8 flex flex-wrap items-center gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded-full border px-4 py-1.5 text-xs uppercase tracking-[0.16em] transition-colors ${
                filter === f.value
                  ? "border-neon bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your list…"
            className="w-full max-w-xs rounded-md border border-border bg-card px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-neon"
          />
          <button
            onClick={openAdd}
            className="rounded-md border border-neon/60 bg-primary px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground"
          >
            + Add to watchlist
          </button>
        </div>

        {loading ? (
          <p className="mt-16 text-sm text-muted-foreground">Loading…</p>
        ) : visible.length === 0 ? (
          <p className="mt-16 text-sm text-muted-foreground">Nothing here yet.</p>
        ) : (
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {visible.map((item) => (
              <li
                key={item.id}
                className="overflow-hidden rounded-lg border border-border bg-card"
              >
                <div className="aspect-[2/3] w-full bg-secondary">
                  {item.cover_url ? (
                    <img
                      src={item.cover_url}
                      alt={`${item.title} cover`}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      No cover
                    </div>
                  )}
                </div>
                <div className="space-y-2 p-4">
                  <h2 className="text-sm font-semibold">{item.title}</h2>
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    {typeLabel(item.media_type)}
                    {item.language ? ` · ${item.language}` : ""}
                  </p>
                  <select
                    value={item.status}
                    onChange={(e) => changeStatus(item, e.target.value as WatchStatus)}
                    className="w-full rounded-md border border-border bg-secondary px-2 py-1.5 text-xs"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {statusLabel(s, item.media_type)}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-4 pt-1 text-xs uppercase tracking-[0.16em]">
                    <button
                      onClick={() => openEdit(item)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => remove(item)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-6">
          <form
            onSubmit={save}
            className="w-full max-w-md space-y-4 rounded-lg border border-border bg-card p-6"
          >
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em]">
              {editing ? "Edit item" : "Add to watchlist"}
            </h2>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Title"
              className="w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm"
            />
            <input
              value={form.cover_url}
              onChange={(e) => setForm({ ...form, cover_url: e.target.value })}
              placeholder="Cover / banner URL"
              className="w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm"
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                value={form.media_type}
                onChange={(e) => setForm({ ...form, media_type: e.target.value as MediaType })}
                className="rounded-md border border-border bg-secondary px-3 py-2 text-sm"
              >
                {MEDIA_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as WatchStatus })}
                className="rounded-md border border-border bg-secondary px-3 py-2 text-sm"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {statusLabel(s, form.media_type)}
                  </option>
                ))}
              </select>
            </div>
            <input
              value={form.language}
              onChange={(e) => setForm({ ...form, language: e.target.value })}
              placeholder="Language (optional)"
              className="w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm"
            />
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Notes (optional)"
              rows={3}
              className="w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm"
            />
            <div className="flex justify-end gap-3 text-xs uppercase tracking-[0.18em]">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-3 py-2 text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md border border-neon/60 bg-primary px-4 py-2 font-semibold text-primary-foreground"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
