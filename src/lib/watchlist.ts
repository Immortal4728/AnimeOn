export type MediaType = "anime" | "movie" | "kdrama" | "tv" | "web" | "game" | "other";
export type WatchStatus = "want" | "active" | "completed" | "dropped";

export const MEDIA_TYPES: { value: MediaType; label: string }[] = [
  { value: "anime", label: "Anime" },
  { value: "movie", label: "Movie" },
  { value: "kdrama", label: "K-Drama" },
  { value: "tv", label: "TV Show" },
  { value: "web", label: "Web Series" },
  { value: "game", label: "Game" },
  { value: "other", label: "Other" },
];

export const FILTERS: { value: "all" | MediaType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "anime", label: "Anime" },
  { value: "movie", label: "Movies" },
  { value: "kdrama", label: "K-Dramas" },
  { value: "tv", label: "TV Shows" },
  { value: "web", label: "Web Series" },
  { value: "game", label: "Games" },
];

export const STATUSES: WatchStatus[] = ["want", "active", "completed", "dropped"];

export function statusLabel(status: string, type: string): string {
  const game = type === "game";
  switch (status) {
    case "want":
      return game ? "Want to Play" : "Want to Watch";
    case "active":
      return game ? "Playing" : "Watching";
    case "completed":
      return "Completed";
    case "dropped":
      return "Dropped";
    default:
      return status;
  }
}

export function typeLabel(type: string): string {
  return MEDIA_TYPES.find((t) => t.value === type)?.label ?? "Other";
}

export interface WatchlistItem {
  id: string;
  user_id: string;
  title: string;
  cover_url: string | null;
  media_type: MediaType;
  language: string | null;
  status: WatchStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
