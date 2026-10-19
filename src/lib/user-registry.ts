import { doc, setDoc, getDocs, collection, query, orderBy } from "firebase/firestore";
import { db } from "./firebase";

export interface RegisteredUser {
  id: string;
  email: string | null;
  created_at: string;
}

const REGISTRY_KEY = "animeon_registered_users_v1";

export function recordUserProfile(user: { id: string; email: string | null; created_at?: string | undefined }): RegisteredUser {
  const profile: RegisteredUser = {
    id: user.id,
    email: user.email || "user@gmail.com",
    created_at: user.created_at || new Date().toISOString(),
  };

  // 1. Sync directly to Firebase Firestore users/profiles
  if (user.id) {
    const userRef = doc(db, "users", user.id);
    setDoc(userRef, {
      uid: user.id,
      email: profile.email,
      lastLoginAt: profile.created_at,
    }, { merge: true }).catch((err) => {
      console.info("Firestore user profile sync note:", err?.message || err);
    });
  }

  // 2. Persist to local registry
  try {
    const raw = localStorage.getItem(REGISTRY_KEY);
    const registry: RegisteredUser[] = raw ? JSON.parse(raw) : [];

    const existingIndex = registry.findIndex(
      (u) => u.id === profile.id || (u.email && u.email.toLowerCase() === (profile.email || "").toLowerCase())
    );

    if (existingIndex >= 0) {
      registry[existingIndex] = { ...registry[existingIndex], ...profile };
    } else {
      registry.unshift(profile);
    }

    localStorage.setItem(REGISTRY_KEY, JSON.stringify(registry));
  } catch (e) {
    console.warn("Registry save note:", e);
  }

  return profile;
}

export async function fetchAllUsers(): Promise<RegisteredUser[]> {
  const userMap = new Map<string, RegisteredUser>();

  // 1. Fetch from Firestore users collection
  try {
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(query(usersRef));
    snapshot.forEach((d) => {
      const data = d.data();
      const uid = d.id;
      userMap.set(uid, {
        id: uid,
        email: data.email || null,
        created_at: data.lastLoginAt || data.createdAt || new Date().toISOString(),
      });
    });
  } catch (e) {
    console.warn("Firestore user fetch note:", e);
  }

  // 2. Merge local persistent registry
  try {
    const raw = localStorage.getItem(REGISTRY_KEY);
    if (raw) {
      const localUsers: RegisteredUser[] = JSON.parse(raw);
      localUsers.forEach((u) => {
        if (u.id && !userMap.has(u.id)) {
          userMap.set(u.id, u);
        }
      });
    }
  } catch (e) {
    console.warn("Local registry fetch note:", e);
  }

  const result = Array.from(userMap.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return result;
}
