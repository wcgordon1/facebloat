import { Navigate, createFileRoute } from '@tanstack/react-router';
import { useConvexAuth } from 'convex/react';

export const Route = createFileRoute("/_app/signup/_layout/")({
  component: Signup,
});

function Signup() {
  const { isAuthenticated } = useConvexAuth();
  
  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }
  
  // Redirect to Clerk's hosted sign-up page
  window.location.href = `${window.location.origin}/sign-up`;
  
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <p>Redirecting to sign up...</p>
    </div>
  );
}
