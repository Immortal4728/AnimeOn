import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  getFirestore,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCBsVL76LshfoCcDJoNMgmCU3779mfjnIY",
  authDomain: "animeon-c4c5e.firebaseapp.com",
  projectId: "animeon-c4c5e",
  storageBucket: "animeon-c4c5e.firebasestorage.app",
  messagingSenderId: "140448359270",
  appId: "1:140448359270:web:26eac232574849b3bfdea7",
  measurementId: "G-ERS3S9PRLW",
};

// Initialize Firebase app (singleton pattern)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// Enable persistent local cache for instant loading on subsequent visits
let db: ReturnType<typeof getFirestore>;
try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  });
} catch {
  db = getFirestore(app);
}

let analytics: Analytics | null = null;

if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch((err) => {
    console.warn("Firebase Analytics initialization warning:", err);
  });
}

export { app, auth, db, analytics, firebaseConfig };
