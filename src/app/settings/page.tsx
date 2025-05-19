import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/options";
import { SettingsPageClient } from "./settings-page-client";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import React from "react";

export const generateMetadata = async (): Promise<Metadata> => ({
  title: "Settings | NextMove",
  description: "Manage your NextMove account settings and preferences.",
});

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    // If no user session, redirect to login, preserving the intended destination
    redirect("/auth/login?callbackUrl=/settings");
  }

  // Render the client component, passing the session data
  return <SettingsPageClient session={session} />;
}
