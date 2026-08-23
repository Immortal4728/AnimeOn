export type MediaType = "anime" | "movie" | "kdrama" | "web" | "game" | "porn" | "tv" | "other";
export type WatchStatus = "want" | "completed";

export const MEDIA_TYPES: { value: MediaType; label: string }[] = [
  { value: "anime", label: "Anime" },
  { value: "movie", label: "Movie" },
  { value: "kdrama", label: "K-Drama" },
  { value: "web", label: "Web Series" },
  { value: "game", label: "Game" },
  { value: "porn", label: "Porn" },
  { value: "tv", label: "TV Show" },
  { value: "other", label: "Other" },
];

export const MEDIA_FILTERS: { value: MediaType; label: string }[] = [
  { value: "anime", label: "Anime" },
  { value: "movie", label: "Movies" },
  { value: "kdrama", label: "K-Dramas" },
  { value: "web", label: "Web Series" },
  { value: "game", label: "Games" },
  { value: "porn", label: "Porn" },
];

export const FILTERS: { value: "all" | MediaType; label: string }[] = [
  { value: "all", label: "All" },
  ...MEDIA_FILTERS,
];

export const STATUSES: WatchStatus[] = ["want", "completed"];

export const STATUS_FILTERS: { value: "all" | WatchStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "want", label: "Want to Watch" },
  { value: "completed", label: "Completed" },
];

export function statusLabel(status: string, type: string): string {
  const game = type === "game";
  switch (status) {
    case "want":
      return game ? "Want to Play" : "Want to Watch";
    case "completed":
      return "Completed";
    default:
      return status;
  }
}

export function typeLabel(type: string): string {
  return MEDIA_TYPES.find((t) => t.value === type)?.label ?? "Other";
}

export interface Shelf {
  id: string;
  user_id: string;
  name: string;
  media_type: MediaType;
  created_at: string;
  updated_at: string;
}

export interface WatchlistItem {
  id: string;
  user_id: string;
  title: string;
  cover_url: string | null;
  link?: string | null;
  media_type: MediaType;
  shelf_id: string | null;
  shelf_name: string | null;
  language: string | null;
  status: WatchStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
