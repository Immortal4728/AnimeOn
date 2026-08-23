import { supabase } from "@/integrations/supabase/client";

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

  // 1. Sync to Supabase profiles table
  supabase
    .from("profiles")
    .upsert(profile, { onConflict: "id" })
    .then(({ error }) => {
      if (error) {
        console.info("Supabase profile sync info:", error.message);
      }
    });

  // 2. Persist to local registry (ensures dashboard works seamlessly even with RLS)
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

  // 1. Fetch from Supabase profiles
  try {
    const { data } = await supabase
      .from("profiles")
      .select("id, email, created_at")
      .order("created_at", { ascending: false });

    if (data && data.length > 0) {
      data.forEach((p) => {
        if (p.id) {
          userMap.set(p.id, {
            id: p.id,
            email: p.email,
            created_at: p.created_at || new Date().toISOString(),
          });
        }
      });
    }
  } catch (e) {
    console.warn("Supabase profile query note:", e);
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
