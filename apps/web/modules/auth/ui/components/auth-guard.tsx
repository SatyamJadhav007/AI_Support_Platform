"use client";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";

import { AuthLayout } from "../layouts/auth-layout";

import { SignInView } from "../views/sign-in-view";

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {/* if Loading...Then show centered "Loading..." on the page */}
      <AuthLoading>
        <AuthLayout>
          <p>Loading...</p>
        </AuthLayout>
      </AuthLoading>
      {/* Ok!! your authenticated so show the children content */}
      <Authenticated>{children}</Authenticated>
      {/* Oh no!! your not authenticated so show the sign in view */}
      <Unauthenticated>
        <AuthLayout>
          <SignInView />
        </AuthLayout>
      </Unauthenticated>
    </>
  );
};
