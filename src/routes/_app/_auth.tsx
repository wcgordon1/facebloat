import { Authenticated, Unauthenticated } from 'convex/react';
import { Outlet, createFileRoute, Navigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { convexQuery } from '@convex-dev/react-query';
import { api } from '@cvx/_generated/api';

function AuthLayout() {
  const { data: user } = useQuery(convexQuery(api.app.getCurrentUser, {}));

  return (
    <>
      <Authenticated>
        {user && !user.username && !window.location.pathname.includes('/onboarding') ? (
          <Navigate to="/onboarding/username" replace />
        ) : (
          <Outlet />
        )}
      </Authenticated>
      <Unauthenticated>
        <Navigate to="/" replace />
      </Unauthenticated>
    </>
  );
}

export const Route = createFileRoute("/_app/_auth")({
  component: AuthLayout,
});
