"use client";

import { Toaster as SonnerToaster } from "sonner";
import { useTheme } from "next-themes";

export function Toaster() {
  const { theme } = useTheme();

  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            "group toast group flex w-full items-center border border-border bg-background p-4 shadow-lg",
          title: "text-foreground font-medium",
          description: "text-muted-foreground text-sm",
          actionButton: "bg-primary text-primary-foreground",
          cancelButton: "bg-muted text-muted-foreground",
          success: "border-green-500 [&>[data-icon]]:text-green-500",
          error: "border-destructive [&>[data-icon]]:text-destructive",
          info: "border-blue-500 [&>[data-icon]]:text-blue-500",
          warning: "border-yellow-500 [&>[data-icon]]:text-yellow-500",
        },
      }}
      theme={theme as "light" | "dark" | "system"}
    />
  );
}
