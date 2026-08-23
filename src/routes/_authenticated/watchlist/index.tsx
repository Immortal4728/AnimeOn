import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/watchlist/")({
  beforeLoad: () => {
    throw redirect({
      to: "/watchlist/$category",
      params: { category: "anime" },
      replace: true,
    });
  },
});
