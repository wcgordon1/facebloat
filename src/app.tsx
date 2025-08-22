import { RouterProvider } from "@tanstack/react-router";
import { HelmetProvider } from "react-helmet-async";
import { router } from "@/router";
import "@/i18n";
import { useQueryClient } from "@tanstack/react-query";

function InnerApp() {
  const queryClient = useQueryClient();
  return <RouterProvider router={router} context={{ queryClient }} />;
}

export default function App() {
  return (
    <HelmetProvider>
      <InnerApp />
    </HelmetProvider>
  );
}
