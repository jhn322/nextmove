"use client";

import React, { createContext, useContext } from "react";
import { Session } from "next-auth";
import {
  useSession,
  signIn as nextAuthSignIn,
  signOut as nextAuthSignOut,
  type SignInOptions,
  type SignOutParams,
  type SignInResponse,
} from "next-auth/react";

interface AuthContextType {
  session: Session | null;
  status: "loading" | "authenticated" | "unauthenticated";
  signIn: (
    provider?: string,
    options?: SignInOptions,
    authorizationParams?: Record<string, string> | undefined
  ) => Promise<SignInResponse | undefined>;
  signOut: <R extends boolean = true>(
    options?: SignOutParams<R>
  ) => Promise<void>;
  refreshSession: () => Promise<Session | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status, update } = useSession();

  const refreshSession = async (): Promise<Session | null> => {
    try {
      const updatedSession = await update();
      return updatedSession;
    } catch (error) {
      console.error("[AuthContext] Error refreshing session:", error);
      return null;
    }
  };

  const handleSignIn = async (
    provider?: string,
    options?: SignInOptions,
    authorizationParams?: Record<string, string> | undefined
  ): Promise<SignInResponse | undefined> => {
    try {
      if (!provider && (!options || options.callbackUrl)) {
        console.warn("[AuthContext] signIn called without a provider.");
      }
      const signInOptions = { redirect: true, ...options };
      return await nextAuthSignIn(provider, signInOptions, authorizationParams);
    } catch (error) {
      console.error("[AuthContext] Sign in error:", error);
      return undefined;
    }
  };

  const handleSignOut = async <R extends boolean = true>(
    options?: SignOutParams<R>
  ) => {
    try {
      const signOutOptions = { redirect: true, ...options };
      await nextAuthSignOut(signOutOptions);
    } catch (error) {
      console.error("[AuthContext] Sign out error:", error);
    }
  };

  const value: AuthContextType = {
    session,
    status,
    signIn: handleSignIn,
    signOut: handleSignOut,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
