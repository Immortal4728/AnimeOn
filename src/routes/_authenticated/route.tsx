import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { supabase } from "@/integrations/supabase/client";
import { auth } from "@/lib/firebase";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    // 1. Check Supabase session
    const { data } = await supabase.auth.getUser();
    if (data?.user) {
      return { user: data.user };
    }

    // 2. Check Firebase session
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      return {
        user: {
          id: firebaseUser.uid,
          email: firebaseUser.email,
        },
      };
    }

    // 3. Fallback redirect if neither session exists
    throw redirect({ to: "/login" });
  },
  component: () => <Outlet />,
});
