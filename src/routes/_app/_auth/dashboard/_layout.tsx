import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Navigation } from "./-ui.navigation";
import { Header } from "@/ui/header";
import { FloatingChatWidget } from "@/ui/floating-chat-widget";
import { ChatProvider } from "@/ui/chat-context";
import { useQuery, useMutation } from "@tanstack/react-query";
import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { api } from "@cvx/_generated/api";
import { useEffect } from "react";

export const Route = createFileRoute("/_app/_auth/dashboard/_layout")({
  component: DashboardLayout,
});

function DashboardLayout() {
  const { data: user } = useQuery(convexQuery(api.app.getCurrentUser, {}));
  const { mutateAsync: syncUser } = useMutation({
    mutationFn: useConvexMutation(api.app.syncCurrentUser),
  });

  // Sync user to database when getCurrentUser returns null (user not in DB yet)
  useEffect(() => {
    if (user === null) {
      // User is authenticated in Clerk but not in database, sync them
      syncUser({}).catch(console.error);
    }
  }, [user, syncUser]);

  if (!user) {
    return (
      <div className="flex min-h-[100vh] w-full items-center justify-center">
        <p>Setting up your account...</p>
      </div>
    );
  }

  return (
    <ChatProvider>
      <div className="flex min-h-[100vh] w-full flex-col bg-secondary dark:bg-black">
        <Navigation user={user} />
        <Header />
        <Outlet />
        <FloatingChatWidget />
      </div>
    </ChatProvider>
  );
}
