import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Navigation } from "./-ui.navigation";
import { Header } from "@/ui/header";
import { FloatingChatWidget } from "@/ui/floating-chat-widget";
import { ChatProvider } from "@/ui/chat-context";
import { useQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "@cvx/_generated/api";

export const Route = createFileRoute("/_app/_auth/dashboard/_layout")({
  component: DashboardLayout,
});

function DashboardLayout() {
  const { data: user } = useQuery(convexQuery(api.app.getCurrentUser, {}));
  if (!user) {
    return null;
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
