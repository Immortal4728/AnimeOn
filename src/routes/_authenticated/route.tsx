import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    // Wait for Firebase Auth state to resolve asynchronously from IndexedDB/Session
    const firebaseUser = await new Promise((resolve) => {
      if (auth.currentUser) {
        resolve(auth.currentUser);
        return;
      }
      const unsubscribe = onAuthStateChanged(
        auth,
        (user) => {
          unsubscribe();
          resolve(user);
        },
        () => {
          unsubscribe();
          resolve(null);
        }
      );

      // Safety timeout after 2.5s
      setTimeout(() => {
        unsubscribe();
        resolve(auth.currentUser);
      }, 2500);
    });

    if (!firebaseUser) {
      throw redirect({ to: "/login" });
    }

    return { user: firebaseUser };
  },
  component: () => <Outlet />,
});
