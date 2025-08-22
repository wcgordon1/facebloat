import { Authenticated, Unauthenticated } from 'convex/react';
import { Outlet, createFileRoute, Navigate } from '@tanstack/react-router';

function AuthLayout() {
  return (
    <>
      <Authenticated>
        <Outlet />
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
