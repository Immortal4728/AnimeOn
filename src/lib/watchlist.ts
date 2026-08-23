export type MediaType = "anime" | "movie" | "kdrama" | "web" | "game" | "porn" | "book" | "tv" | "other";
export type WatchStatus = "want" | "completed";

export const MEDIA_TYPES: { value: MediaType; label: string }[] = [
  { value: "anime", label: "Anime" },
  { value: "movie", label: "Movie" },
  { value: "kdrama", label: "K-Drama" },
  { value: "web", label: "Web Series" },
  { value: "game", label: "Game" },
  { value: "porn", label: "Porn" },
  { value: "book", label: "Books" },
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
  { value: "book", label: "Books" },
];

export const FILTERS: { value: "all" | MediaType; label: string }[] = [
  { value: "all", label: "All" },
  ...MEDIA_FILTERS,
];

export const STATUSES: WatchStatus[] = ["want", "completed"];

export const STATUS_FILTERS: { value: WatchStatus; label: string }[] = [
  { value: "want", label: "Want to Watch" },
  { value: "completed", label: "Completed" },
];

export function statusLabel(status: string, type: string): string {
  if (status === "want") {
    if (type === "game") return "Want to Play";
    if (type === "book") return "Want to Read";
    return "Want to Watch";
  }
  if (status === "completed") {
    return "Completed";
  }
  return status;
}

export function categorySlugToType(slug?: string): MediaType {
  if (!slug) return "anime";
  const normalized = slug.toLowerCase().trim();
  switch (normalized) {
    case "anime":
      return "anime";
    case "movies":
    case "movie":
      return "movie";
    case "k-dramas":
    case "kdrama":
      return "kdrama";
    case "web-series":
    case "web":
      return "web";
    case "games":
    case "game":
      return "game";
    case "porn":
      return "porn";
    case "books":
    case "book":
      return "book";
    default:
      return "anime";
  }
}

export function mediaTypeToSlug(type: MediaType): string {
  switch (type) {
    case "anime":
      return "anime";
    case "movie":
      return "movies";
    case "kdrama":
      return "k-dramas";
    case "web":
      return "web-series";
    case "game":
      return "games";
    case "porn":
      return "porn";
    case "book":
      return "books";
    default:
      return "anime";
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
  author?: string | null;
  cover_url: string | null;
  link?: string | null;
  actressName?: string | null;
  actress_name?: string | null;
  media_type: MediaType;
  shelf_id: string | null;
  shelf_name: string | null;
  status: WatchStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
