import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,

  beforeLoad: async () => {
    const isAuth = localStorage.getItem("admin-auth");

    if (isAuth !== "true") {
      throw redirect({
        to: "/auth",
      });
    }

    return {
      user: {
        username: "admin",
      },
      isAdmin: true,
    };
  },

  component: () => <Outlet />,
});