import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { WatchlistItem, Shelf, MediaType, WatchStatus } from "@/lib/watchlist";

export interface CreateWatchlistItemInput {
  title: string;
  cover_url: string | null;
  link?: string | null;
  media_type: MediaType;
  shelf_id?: string | null;
  shelf_name?: string | null;
  language: string | null;
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
      const q = query(colRef, orderBy("created_at", "asc"));
      snapshot = await getDocs(q);
    } catch (orderErr) {
      console.warn("orderBy shelves query failed, falling back to unordered getDocs:", orderErr);
      snapshot = await getDocs(colRef);
    }

    const shelves = snapshot.docs.map((docSnap) => {
      const data = docSnap.data() as Record<string, any>;
      const createdAt = data["created_at"] || data["createdAt"];
      const updatedAt = data["updated_at"] || data["updatedAt"];

      return {
        id: docSnap.id,
        user_id: uid,
        name: data["name"] || "",
        media_type: (data["media_type"] || data["mediaType"] || "anime") as MediaType,
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
    console.error("Firestore shelves read failure:", error);
    return [];
  }
}

export async function createShelf(
  uid: string,
  name: string,
  mediaType: MediaType
): Promise<Shelf> {
  if (!uid) throw new Error("User UID required");

  try {
    const colRef = collection(db, "users", uid, "shelves");
    const docData: Record<string, any> = {
      name: name.trim(),
      media_type: mediaType,
      mediaType: mediaType,
      created_at: serverTimestamp(),
      createdAt: serverTimestamp(),
      updated_at: serverTimestamp(),
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
    console.error("Firestore shelf create failure:", error);
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
      updated_at: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const itemsCol = collection(db, "users", uid, "watchlist");
    const q1 = query(itemsCol, where("shelf_id", "==", shelfId));
    const snap1 = await getDocs(q1);
    const updatePromises = snap1.docs.map((d) =>
      updateDoc(d.ref, {
        shelf_name: newName.trim(),
        shelfName: newName.trim(),
        updatedAt: serverTimestamp(),
        updated_at: serverTimestamp(),
      })
    );
    await Promise.all(updatePromises);
  } catch (error) {
    console.error("Firestore shelf rename failure:", error);
    throw error;
  }
}

export async function deleteShelf(uid: string, shelfId: string): Promise<void> {
  if (!uid || !shelfId) throw new Error("User UID and Shelf ID required");

  try {
    const itemsCol = collection(db, "users", uid, "watchlist");
    const q = query(itemsCol, where("shelf_id", "==", shelfId));
    const snap = await getDocs(q);

    const movePromises = snap.docs.map((d) =>
      updateDoc(d.ref, {
        shelf_id: null,
        shelfId: null,
        shelf_name: null,
        shelfName: null,
        updated_at: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );
    await Promise.all(movePromises);

    const shelfDocRef = doc(db, "users", uid, "shelves", shelfId);
    await deleteDoc(shelfDocRef);
  } catch (error) {
    console.error("Firestore shelf delete failure:", error);
    throw error;
  }
}

/* ============================================================================
 * 2. WATCHLIST ITEMS API (users/{uid}/watchlist/{itemId})
 * ============================================================================ */

export async function fetchUserWatchlist(uid: string): Promise<WatchlistItem[]> {
  if (!uid) return [];
  try {
    const colRef = collection(db, "users", uid, "watchlist");
    let snapshot;
    try {
      const q = query(colRef, orderBy("created_at", "desc"));
      snapshot = await getDocs(q);
    } catch (orderErr) {
      console.warn("orderBy watchlist query failed, falling back to unordered getDocs:", orderErr);
      snapshot = await getDocs(colRef);
    }

    const items = snapshot.docs.map((docSnap) => {
      const data = docSnap.data() as Record<string, any>;
      const createdAt = data["created_at"] || data["createdAt"];
      const updatedAt = data["updated_at"] || data["updatedAt"];

      return {
        id: docSnap.id,
        user_id: uid,
        title: data["title"] || "",
        cover_url: data["cover_url"] || data["imageUrl"] || null,
        link: data["link"] || null,
        media_type: (data["media_type"] || data["type"] || "anime") as MediaType,
        shelf_id: data["shelf_id"] || data["shelfId"] || null,
        shelf_name: data["shelf_name"] || data["shelfName"] || null,
        language: data["language"] || null,
        status: (data["status"] || "want") as WatchStatus,
        notes: data["notes"] || null,
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

    return items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } catch (error) {
    console.error(`[Firestore Error] watchlist read failure for uid: ${uid}`, error);
    return [];
  }
}

export async function addWatchlistItem(
  uid: string,
  input: CreateWatchlistItemInput
): Promise<WatchlistItem> {
  if (!uid) throw new Error("User UID required");

  try {
    const colRef = collection(db, "users", uid, "watchlist");

    // Clean data object - NO undefined properties permitted in Firestore addDoc
    const docData: Record<string, any> = {
      title: input.title.trim(),
      cover_url: input.cover_url || null,
      imageUrl: input.cover_url || null,
      link: input.link || null,
      media_type: input.media_type,
      type: input.media_type,
      shelf_id: input.shelf_id || null,
      shelfId: input.shelf_id || null,
      shelf_name: input.shelf_name || null,
      shelfName: input.shelf_name || null,
      language: input.language || null,
      status: input.status,
      notes: input.notes || null,
      created_at: serverTimestamp(),
      createdAt: serverTimestamp(),
      updated_at: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    console.log(`[Firestore Write] Saving item to users/${uid}/watchlist:`, docData);
    const docRef = await addDoc(colRef, docData);
    console.log(`[Firestore Success] Created document ID: ${docRef.id}`);

    const nowIso = new Date().toISOString();

    return {
      id: docRef.id,
      user_id: uid,
      title: input.title.trim(),
      cover_url: input.cover_url || null,
      link: input.link || null,
      media_type: input.media_type,
      shelf_id: input.shelf_id || null,
      shelf_name: input.shelf_name || null,
      language: input.language || null,
      status: input.status,
      notes: input.notes || null,
      created_at: nowIso,
      updated_at: nowIso,
    };
  } catch (error) {
    console.error(`[Firestore Error] Failed to add item to users/${uid}/watchlist:`, error);
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
      updated_at: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    if (updates.title !== undefined) updateData["title"] = updates.title.trim();
    if (updates.cover_url !== undefined) {
      updateData["cover_url"] = updates.cover_url || null;
      updateData["imageUrl"] = updates.cover_url || null;
    }
    if (updates.link !== undefined) {
      updateData["link"] = updates.link || null;
    }
    if (updates.media_type !== undefined) {
      updateData["media_type"] = updates.media_type;
      updateData["type"] = updates.media_type;
    }
    if (updates.shelf_id !== undefined) {
      updateData["shelf_id"] = updates.shelf_id || null;
      updateData["shelfId"] = updates.shelf_id || null;
    }
    if (updates.shelf_name !== undefined) {
      updateData["shelf_name"] = updates.shelf_name || null;
      updateData["shelfName"] = updates.shelf_name || null;
    }
    if (updates.language !== undefined) {
      updateData["language"] = updates.language || null;
    }
    if (updates.status !== undefined) {
      updateData["status"] = updates.status;
    }
    if (updates.notes !== undefined) {
      updateData["notes"] = updates.notes || null;
    }

    console.log(`[Firestore Update] Updating users/${uid}/watchlist/${itemId}:`, updateData);
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
