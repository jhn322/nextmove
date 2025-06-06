"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Github, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants/site";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  return (
    <footer className="w-full border-t border-border/30 py-6 bg-background/80 backdrop-blur-sm z-10 relative mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col items-center md:items-start">
            <p className="text-sm text-muted-foreground">
              © {currentYear} {APP_NAME}. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Made with{" "}
              <Heart className="inline-block h-3 w-3 text-red-500 mx-1 animate-pulse" />{" "}
              for chess enthusiasts
            </p>
            <div className="flex space-x-4 mt-2">
              <Link
                href="/privacypolicy"
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
                onMouseEnter={() => setHoveredElement("privacy")}
                onMouseLeave={() => setHoveredElement(null)}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setMousePosition({
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top,
                  });
                }}
              >
                Privacy Policy
                {hoveredElement === "privacy" && (
                  <div
                    className="h-0.5 bg-primary mt-0.5 transform origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100"
                    style={{
                      transform:
                        hoveredElement === "privacy"
                          ? "scaleX(1)"
                          : "scaleX(0)",
                    }}
                  />
                )}
              </Link>
              <Link
                href="/termsofservice"
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
                onMouseEnter={() => setHoveredElement("terms")}
                onMouseLeave={() => setHoveredElement(null)}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setMousePosition({
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top,
                  });
                }}
              >
                Terms of Service
                {hoveredElement === "terms" && (
                  <div
                    className="h-0.5 bg-primary mt-0.5 transform origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100"
                    style={{
                      transform:
                        hoveredElement === "terms" ? "scaleX(1)" : "scaleX(0)",
                    }}
                  />
                )}
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="https://github.com/jhn322/chess-next"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "p-2 rounded-full transition-colors relative overflow-hidden",
                "hover:bg-accent hover:text-accent-foreground"
              )}
              aria-label="GitHub Repository"
              onMouseEnter={() => setHoveredElement("github")}
              onMouseLeave={() => setHoveredElement(null)}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setMousePosition({
                  x: e.clientX - rect.left,
                  y: e.clientY - rect.top,
                });
              }}
            >
              {hoveredElement === "github" && (
                <div
                  className="absolute inset-0 pointer-events-none transition-opacity"
                  style={{
                    background: `radial-gradient(circle 30px at ${mousePosition.x}px ${mousePosition.y}px, rgba(var(--accent), 0.5), transparent 70%)`,
                    zIndex: 0,
                  }}
                />
              )}
              <Github className="h-5 w-5 relative z-10" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
