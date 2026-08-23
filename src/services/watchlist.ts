import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { app, db } from "@/lib/firebase";
import type { WatchlistItem, Shelf, MediaType, WatchStatus } from "@/lib/watchlist";

export interface CreateWatchlistItemInput {
  title: string;
  author?: string | null;
  imageUrl: string | null;
  link?: string | null;
  actressName?: string | null;
  type: MediaType;
  shelfId?: string | null;
  shelfName?: string | null;
  status: WatchStatus;
  notes: string | null;
}

/* ============================================================================
 * 1. SHELVES API (users/{uid}/shelves/{shelfId})
 * ============================================================================ */

export async function fetchUserShelves(uid: string): Promise<Shelf[]> {
  if (!uid) return [];
  try {
    const colRef = collection(db, "users", uid, "shelves");
    let snapshot;
    try {
      const q = query(colRef, orderBy("createdAt", "asc"));
      snapshot = await getDocs(q);
    } catch {
      snapshot = await getDocs(colRef);
    }

    const shelves = snapshot.docs.map((docSnap) => {
      const data = docSnap.data() as Record<string, any>;
      const createdAt = data["createdAt"] || data["created_at"];
      const updatedAt = data["updatedAt"] || data["updated_at"];

      return {
        id: docSnap.id,
        user_id: uid,
        name: data["name"] || "",
        media_type: (data["mediaType"] || data["media_type"] || "anime") as MediaType,
        created_at: createdAt?.toDate
          ? createdAt.toDate().toISOString()
          : typeof createdAt === "string"
          ? createdAt
          : new Date().toISOString(),
        updated_at: updatedAt?.toDate
          ? updatedAt.toDate().toISOString()
          : typeof updatedAt === "string"
          ? updatedAt
          : new Date().toISOString(),
      };
    });

    return shelves.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  } catch (error) {
    console.error(`[Firestore Error] Failed to fetch shelves for uid: ${uid}`, error);
    return [];
  }
}

export async function createShelf(
  uid: string,
  name: string,
  mediaType: MediaType
): Promise<Shelf> {
  if (!uid) throw new Error("User authentication required");

  try {
    const colRef = collection(db, "users", uid, "shelves");
    const docData: Record<string, any> = {
      name: name.trim(),
      mediaType: mediaType,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(colRef, docData);
    const nowIso = new Date().toISOString();

    return {
      id: docRef.id,
      user_id: uid,
      name: name.trim(),
      media_type: mediaType,
      created_at: nowIso,
      updated_at: nowIso,
    };
  } catch (error) {
    console.error(`[Firestore Error] Failed to create shelf for uid: ${uid}`, error);
    throw error;
  }
}

export async function renameShelf(
  uid: string,
  shelfId: string,
  newName: string
): Promise<void> {
  if (!uid || !shelfId) throw new Error("User UID and Shelf ID required");

  try {
    const docRef = doc(db, "users", uid, "shelves", shelfId);
    await updateDoc(docRef, {
      name: newName.trim(),
      updatedAt: serverTimestamp(),
    });

    const itemsCol = collection(db, "users", uid, "watchlist");
    const q1 = query(itemsCol, where("shelfId", "==", shelfId));
    const snap1 = await getDocs(q1);
    const updatePromises = snap1.docs.map((d) =>
      updateDoc(d.ref, {
        shelfName: newName.trim(),
        updatedAt: serverTimestamp(),
      })
    );
    await Promise.all(updatePromises);
  } catch (error) {
    console.error(`[Firestore Error] Failed to rename shelf ${shelfId}:`, error);
    throw error;
  }
}

export async function deleteShelf(uid: string, shelfId: string): Promise<void> {
  if (!uid || !shelfId) throw new Error("User UID and Shelf ID required");

  try {
    const itemsCol = collection(db, "users", uid, "watchlist");
    const q = query(itemsCol, where("shelfId", "==", shelfId));
    const snap = await getDocs(q);

    const movePromises = snap.docs.map((d) =>
      updateDoc(d.ref, {
        shelfId: null,
        shelfName: null,
        updatedAt: serverTimestamp(),
      })
    );
    await Promise.all(movePromises);

    const shelfDocRef = doc(db, "users", uid, "shelves", shelfId);
    await deleteDoc(shelfDocRef);
  } catch (error) {
    console.error(`[Firestore Error] Failed to delete shelf ${shelfId}:`, error);
    throw error;
  }
}

/* ============================================================================
 * 2. WATCHLIST ITEMS API (users/{uid}/watchlist/{itemId})
 * ============================================================================ */

export async function fetchUserWatchlist(uid: string): Promise<WatchlistItem[]> {
  if (!uid) return [];
  console.log("[WATCHLIST] UID:", uid);
  console.time("[WATCHLIST] fetch");

  try {
    const ref = collection(db, "users", uid, "watchlist");
    const snapshot = await getDocs(ref);

    console.timeEnd("[WATCHLIST] fetch");
    console.log("[WATCHLIST] documents:", snapshot.size);

    const items = snapshot.docs.map((docSnap) => {
      const data = docSnap.data() as Record<string, any>;
      const createdAt = data["createdAt"] || data["created_at"];
      const updatedAt = data["updatedAt"] || data["updated_at"];

      return {
        id: docSnap.id,
        user_id: uid,
        title: data["title"] || "",
        author: data["author"] || data["authorName"] || data["author_name"] || null,
        cover_url: data["imageUrl"] || data["cover_url"] || null,
        link: data["link"] || null,
        actressName: data["actressName"] || data["actress_name"] || null,
        actress_name: data["actressName"] || data["actress_name"] || null,
        media_type: (data["type"] || data["media_type"] || "anime") as MediaType,
        shelf_id: data["shelfId"] || data["shelf_id"] || null,
        shelf_name: data["shelfName"] || data["shelf_name"] || null,
        status: (data["status"] || "want") as WatchStatus,
        notes: data["notes"] || null,
        created_at: createdAt?.toDate
          ? createdAt.toDate().toISOString()
          : typeof createdAt === "string"
          ? createdAt
          : new Date().toISOString(),
        updated_at: updatedAt?.toDate
          ? updatedAt.toDate().toISOString()
          : typeof createdAt === "string"
          ? createdAt
          : new Date().toISOString(),
      };
    });

    return items.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  } catch (error) {
    console.error("[WATCHLIST] Error fetching user watchlist:", error);
    throw error;
  }
}

export async function addWatchlistItem(
  uid: string,
  input: CreateWatchlistItemInput
): Promise<WatchlistItem> {
  if (!uid) throw new Error("User UID required to create watchlist item");

  try {
    const colRef = collection(db, "users", uid, "watchlist");

    const docData: Record<string, any> = {
      title: input.title.trim(),
      author: input.author ? input.author.trim() : null,
      imageUrl: input.imageUrl || null,
      link: input.link || null,
      actressName: input.actressName ? input.actressName.trim() : null,
      type: input.type,
      shelfId: input.shelfId || null,
      shelfName: input.shelfName || null,
      status: input.status,
      notes: input.notes || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(colRef, docData);
    const nowIso = new Date().toISOString();

    return {
      id: docRef.id,
      user_id: uid,
      title: input.title.trim(),
      author: input.author ? input.author.trim() : null,
      cover_url: input.imageUrl || null,
      link: input.link || null,
      actressName: input.actressName ? input.actressName.trim() : null,
      actress_name: input.actressName ? input.actressName.trim() : null,
      media_type: input.type,
      shelf_id: input.shelfId || null,
      shelf_name: input.shelfName || null,
      status: input.status,
      notes: input.notes || null,
      created_at: nowIso,
      updated_at: nowIso,
    };
  } catch (error) {
    console.error("Firestore SAVE failed:", error);
    throw error;
  }
}

export async function updateWatchlistItem(
  uid: string,
  itemId: string,
  updates: Partial<CreateWatchlistItemInput>
): Promise<void> {
  if (!uid || !itemId) throw new Error("User UID and Item ID required");

  try {
    const docRef = doc(db, "users", uid, "watchlist", itemId);
    const updateData: Record<string, any> = {
      updatedAt: serverTimestamp(),
    };

    if (updates.title !== undefined) updateData["title"] = updates.title.trim();
    if (updates.author !== undefined) updateData["author"] = updates.author ? updates.author.trim() : null;
    if (updates.imageUrl !== undefined) updateData["imageUrl"] = updates.imageUrl || null;
    if (updates.link !== undefined) updateData["link"] = updates.link || null;
    if (updates.actressName !== undefined) updateData["actressName"] = updates.actressName ? updates.actressName.trim() : null;
    if (updates.type !== undefined) updateData["type"] = updates.type;
    if (updates.shelfId !== undefined) updateData["shelfId"] = updates.shelfId || null;
    if (updates.shelfName !== undefined) updateData["shelfName"] = updates.shelfName || null;
    if (updates.status !== undefined) updateData["status"] = updates.status;
    if (updates.notes !== undefined) updateData["notes"] = updates.notes || null;
    await updateDoc(docRef, updateData);
    console.log(`[Firestore Success] Updated document ID: ${itemId}`);
  } catch (error) {
    console.error(`[Firestore Error] Failed to update users/${uid}/watchlist/${itemId}:`, error);
    throw error;
  }
}

export async function deleteWatchlistItem(uid: string, itemId: string): Promise<void> {
  if (!uid || !itemId) throw new Error("User UID and Item ID required");

  try {
    const docRef = doc(db, "users", uid, "watchlist", itemId);
    console.log(`[Firestore Delete] Deleting users/${uid}/watchlist/${itemId}`);
    await deleteDoc(docRef);
    console.log(`[Firestore Success] Deleted document ID: ${itemId}`);
  } catch (error) {
    console.error(`[Firestore Error] Failed to delete users/${uid}/watchlist/${itemId}:`, error);
    throw error;
  }
}
