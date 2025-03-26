"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

type ThemeProviderProps = Parameters<typeof NextThemesProvider>[0];

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      themes={[
        "light",
        "dark",
        "system",
        "amethyst",
        "crimson",
        "jade",
        "amber",
        "rose",
        "cyberpunk",
        "pokemon",
        "dracula",
        "fantasy",
        "midnight",
        "classic",
        "comic",
      ]}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
