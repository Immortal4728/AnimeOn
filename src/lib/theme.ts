import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { app, auth, db } from "./firebase";

export interface ThemeOption {
  id: string;
  name: string;
  colorHex: string;
  colorSecondaryHex?: string;
  neonOklch: string;
  neon2Oklch?: string;
  primaryOklch: string;
  accentOklch?: string;
}

export const THEMES: ThemeOption[] = [
  {
    id: "pink",
    name: "Neon Pink",
    colorHex: "#ec4899",
    neonOklch: "oklch(0.72 0.24 340)",
    primaryOklch: "oklch(0.72 0.24 340)",
  },
  {
    id: "purple",
    name: "Cyber Purple",
    colorHex: "#a855f7",
    neonOklch: "oklch(0.68 0.25 300)",
    primaryOklch: "oklch(0.68 0.25 300)",
  },
  {
    id: "blue",
    name: "Electric Blue",
    colorHex: "#3b82f6",
    neonOklch: "oklch(0.65 0.22 250)",
    primaryOklch: "oklch(0.65 0.22 250)",
  },
  {
    id: "crimson",
    name: "Crimson",
    colorHex: "#f43f5e",
    neonOklch: "oklch(0.65 0.24 20)",
    primaryOklch: "oklch(0.65 0.24 20)",
  },
  {
    id: "green",
    name: "Matrix Green",
    colorHex: "#22c55e",
    neonOklch: "oklch(0.72 0.24 145)",
    primaryOklch: "oklch(0.72 0.24 145)",
  },
  {
    id: "tokyo-night",
    name: "Tokyo Night",
    colorHex: "#8b5cf6",
    colorSecondaryHex: "#3b82f6",
    neonOklch: "oklch(0.65 0.24 285)",
    neon2Oklch: "oklch(0.65 0.22 250)",
    primaryOklch: "oklch(0.65 0.24 285)",
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    colorHex: "#ec4899",
    colorSecondaryHex: "#06b6d4",
    neonOklch: "oklch(0.72 0.24 340)",
    neon2Oklch: "oklch(0.75 0.20 200)",
    primaryOklch: "oklch(0.72 0.24 340)",
  },
  {
    id: "sakura",
    name: "Sakura",
    colorHex: "#f472b6",
    colorSecondaryHex: "#d946ef",
    neonOklch: "oklch(0.78 0.18 350)",
    neon2Oklch: "oklch(0.70 0.24 320)",
    primaryOklch: "oklch(0.78 0.18 350)",
  },
  {
    id: "midnight-red",
    name: "Midnight Red",
    colorHex: "#dc2626",
    neonOklch: "oklch(0.58 0.24 25)",
    primaryOklch: "oklch(0.58 0.24 25)",
  },
  {
    id: "arcade-gold",
    name: "Arcade Gold",
    colorHex: "#f59e0b",
    neonOklch: "oklch(0.75 0.20 75)",
    primaryOklch: "oklch(0.75 0.20 75)",
  },
  {
    id: "ice-blue",
    name: "Ice Blue",
    colorHex: "#38bdf8",
    neonOklch: "oklch(0.75 0.18 220)",
    primaryOklch: "oklch(0.75 0.18 220)",
  },
  {
    id: "phantom",
    name: "Phantom",
    colorHex: "#c084fc",
    neonOklch: "oklch(0.72 0.22 315)",
    primaryOklch: "oklch(0.72 0.22 315)",
  },
];

export function getSavedTheme(): string {
  if (typeof window === "undefined") return "pink";
  return localStorage.getItem("animeon_theme") || "pink";
}

export function applyTheme(themeId: string) {
  if (typeof window === "undefined") return;
  const theme = THEMES.find((t) => t.id === themeId) || THEMES[0];
  if (!theme) return;
  const root = document.documentElement;
  root.style.setProperty("--neon", theme.neonOklch);
  root.style.setProperty("--neon-2", theme.neon2Oklch || theme.neonOklch);
  root.style.setProperty("--primary", theme.primaryOklch);
  root.style.setProperty("--ring", theme.primaryOklch);
  if (theme.accentOklch) {
    root.style.setProperty("--accent", theme.accentOklch);
  }
  localStorage.setItem("animeon_theme", theme.id);
}

export function initTheme() {
  if (typeof window === "undefined") return;
  const saved = getSavedTheme();
  applyTheme(saved);
}

export async function fetchUserTheme(uid: string): Promise<string | null> {
  if (!uid) return null;
  console.log("[THEME] Fetching theme for UID:", uid);
  try {
    const themeRef = doc(db, "users", uid, "preferences", "theme");
    const snapshot = await getDoc(themeRef);
    if (snapshot.exists()) {
      const data = snapshot.data();
      const themeVal = data["theme"];
      console.log("[THEME] Read from Firestore:", snapshot.exists(), data);
      if (typeof themeVal === "string") {
        return themeVal;
      }
    } else {
      console.log("[THEME] No stored preference document found. Defaulting to Neon Pink.");
    }
  } catch (error: any) {
    console.error("[THEME] Error reading theme from Firestore:", error?.code, error?.message, error);
  }
  return null;
}

export async function saveUserTheme(uid: string, themeId: string): Promise<boolean> {
  const currentUser = auth.currentUser;
  const targetUid = currentUser?.uid || uid;

  if (!targetUid) {
    console.error("[THEME] FIRESTORE WRITE FAILED: auth.currentUser === null and no UID provided");
    throw new Error("No authenticated Firebase user UID available");
  }

  console.log("========== THEME FIRESTORE TEST ==========");
  console.log("[THEME] auth.currentUser:", currentUser);
  console.log("[THEME] uid:", targetUid);
  console.log("[THEME] selected theme:", themeId);
  console.log("[THEME] project:", app.options.projectId);
  console.log("[THEME] firestore path:", `users/${targetUid}/preferences/theme`);

  try {
    const themeRef = doc(db, "users", targetUid, "preferences", "theme");
    await setDoc(
      themeRef,
      {
        theme: themeId,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    const snapshot = await getDoc(themeRef);
    console.log("[THEME] read after write:", snapshot.exists(), snapshot.data());

    if (snapshot.exists()) {
      console.log("[THEME] FIRESTORE WRITE SUCCESS");
      return true;
    } else {
      throw new Error("Read-after-write snapshot does not exist");
    }
  } catch (error: any) {
    console.error("[THEME] FIRESTORE WRITE FAILED");
    console.error("[THEME] error:", error);
    console.error("[THEME] error code:", error?.code);
    console.error("[THEME] error message:", error?.message);
    throw error;
  }
}
