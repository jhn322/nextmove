"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Menu,
  History,
  Settings,
  LogIn,
  LogOut,
  Sun,
  Moon,
  Laptop,
  Baby,
  Gamepad2,
  BookOpen,
  Sword,
  Crosshair,
  Target,
  Trophy,
  Award,
  ChevronDown,
  icons,
  Crown,
  Home,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import Link from "next/link";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlayOpen, setIsPlayOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { setTheme, theme } = useTheme();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen]);

  const playItems = [
    {
      title: "Beginner",
      href: "/play/beginner",
      icon: Baby,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
    },
    {
      title: "Easy",
      href: "/play/easy",
      icon: Gamepad2,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20",
    },
    {
      title: "Intermediate",
      href: "/play/intermediate",
      icon: BookOpen,
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/20",
    },
    {
      title: "Advanced",
      href: "/play/advanced",
      icon: Sword,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
    },
    {
      title: "Hard",
      href: "/play/hard",
      icon: Crosshair,
      color: "text-violet-500",
      bgColor: "bg-violet-500/10",
      borderColor: "border-violet-500/20",
    },
    {
      title: "Expert",
      href: "/play/expert",
      icon: Target,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
    },
    {
      title: "Master",
      href: "/play/master",
      icon: Award,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20",
    },
    {
      title: "Grandmaster",
      href: "/play/grandmaster",
      icon: Trophy,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/20",
    },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-all duration-300",
        scrolled
          ? "border-border/30 bg-background/80 backdrop-blur-lg"
          : "border-border bg-background"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 h-16">
        {/* Logo Section */}
        <div className="flex items-center">
          <Link
            href="/"
            className="flex items-center space-x-3 hover:opacity-90 transition-all group"
          >
            <div className="relative w-9 h-9 flex-shrink-0 bg-primary/10 rounded-xl p-1.5 group-hover:scale-105 transition-transform">
              <Image
                src="/favicon.svg"
                alt="Pawn Icon"
                style={{ objectFit: "contain" }}
                width={40}
                height={40}
                className="drop-shadow-md"
              />
            </div>
            <span className="font-bold text-xl tracking-tight whitespace-nowrap group-hover:text-primary transition-colors">
              NextMove
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:block">
          <NavigationMenu>
            <NavigationMenuList className="space-x-1">
              <NavigationMenuItem>
                <Link
                  href="/"
                  className={cn(
                    "px-4 py-2 text-base font-medium rounded-xl transition-colors inline-flex items-center",
                    isActive("/")
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Home className="mr-2 h-4 w-4" />
                  <span>Home</span>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger
                  className={cn(
                    "text-base font-medium px-4 py-2 rounded-xl",
                    pathname.startsWith("/play")
                      ? "bg-primary/10 text-primary"
                      : ""
                  )}
                >
                  <Crown className="mr-2 h-4 w-4" />
                  Play
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] grid-cols-2 gap-3 p-4 rounded-xl">
                    {playItems.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            "block select-none rounded-xl p-3 text-base font-medium transition-all hover:scale-[1.02]",
                            isActive(item.href)
                              ? `${item.bgColor} ${item.borderColor} border`
                              : "hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          <span className="flex items-center gap-2">
                            <div
                              className={cn("p-1.5 rounded-lg", item.bgColor)}
                            >
                              <item.icon className={`h-4 w-4 ${item.color}`} />
                            </div>
                            {item.title}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link
                  href="/history"
                  className={cn(
                    "px-4 py-2 text-base font-medium rounded-xl transition-colors inline-flex items-center",
                    isActive("/history")
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <History className="mr-2 h-4 w-4" />
                  History
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link
                  href="/settings"
                  className={cn(
                    "px-4 py-2 text-base font-medium rounded-xl transition-colors inline-flex items-center",
                    isActive("/settings")
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Theme Toggle and Login */}
        <div className="hidden lg:flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm hover:bg-accent/50 transition-colors"
              >
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36 rounded-xl">
              <DropdownMenuItem
                onClick={() => setTheme("light")}
                className={cn(
                  "py-2 cursor-pointer",
                  theme === "light" ? "bg-accent" : ""
                )}
              >
                <Sun className="mr-2 h-4 w-4" />
                <span>Light</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("dark")}
                className={cn(
                  "py-2 cursor-pointer",
                  theme === "dark" ? "bg-accent" : ""
                )}
              >
                <Moon className="mr-2 h-4 w-4" />
                <span>Dark</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("system")}
                className={cn(
                  "py-2 cursor-pointer",
                  theme === "system" ? "bg-accent" : ""
                )}
              >
                <Laptop className="mr-2 h-4 w-4" />
                <span>System</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            onClick={() => setIsLoggedIn(!isLoggedIn)}
            className="text-base px-5 py-2 h-10 inline-flex items-center rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            {isLoggedIn ? (
              <>
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" /> Login
              </>
            )}
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden flex items-center space-x-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm hover:bg-accent/50 transition-colors"
              >
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36 rounded-xl">
              <DropdownMenuItem
                onClick={() => setTheme("light")}
                className={cn(
                  "py-2 cursor-pointer",
                  theme === "light" ? "bg-accent" : ""
                )}
              >
                <Sun className="mr-2 h-4 w-4" />
                <span>Light</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("dark")}
                className={cn(
                  "py-2 cursor-pointer",
                  theme === "dark" ? "bg-accent" : ""
                )}
              >
                <Moon className="mr-2 h-4 w-4" />
                <span>Dark</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("system")}
                className={cn(
                  "py-2 cursor-pointer",
                  theme === "system" ? "bg-accent" : ""
                )}
              >
                <Laptop className="mr-2 h-4 w-4" />
                <span>System</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-xl hover:bg-accent/50"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-full sm:w-80 border-r border-border/30 bg-background/95 backdrop-blur-md"
            >
              <SheetHeader className="border-b pb-4 mb-6">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <SheetDescription className="sr-only">
                  Navigation options for NextMove
                </SheetDescription>
                <Link
                  href="/"
                  className="flex items-center space-x-3 hover:opacity-90 transition-all group"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="relative w-9 h-9 flex-shrink-0 bg-primary/10 rounded-xl p-1.5 group-hover:scale-105 transition-transform">
                    <Image
                      src="/favicon.svg"
                      alt="Pawn Icon"
                      style={{ objectFit: "contain" }}
                      width={40}
                      height={40}
                      className="drop-shadow-md"
                    />
                  </div>
                  <span className="font-bold text-xl tracking-tight whitespace-nowrap group-hover:text-primary transition-colors">
                    NextMove
                  </span>
                </Link>
              </SheetHeader>

              <div className="flex flex-col space-y-1">
                <Link
                  href="/"
                  className={cn(
                    "py-3 px-4 text-base font-medium rounded-xl transition-all flex items-center",
                    isActive("/")
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <Home className="mr-3 h-5 w-5" />
                  Home
                </Link>

                <Collapsible
                  open={isPlayOpen}
                  onOpenChange={setIsPlayOpen}
                  className="space-y-1 w-full"
                >
                  <CollapsibleTrigger
                    className={cn(
                      "flex items-center justify-between w-full py-3 px-4 text-base font-medium rounded-xl transition-all",
                      pathname.startsWith("/play")
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <div className="flex items-center">
                      <Crown className="mr-3 h-5 w-5" />
                      Play
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${
                        isPlayOpen ? "transform rotate-180" : ""
                      }`}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 mt-1">
                    {playItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 py-2.5 px-4 ml-4 text-base font-medium rounded-xl transition-all",
                          isActive(item.href)
                            ? `${item.bgColor} ${item.color}`
                            : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                        )}
                        onClick={() => setIsOpen(false)}
                      >
                        <div className={cn("p-1.5 rounded-lg", item.bgColor)}>
                          <item.icon className={`h-4 w-4 ${item.color}`} />
                        </div>
                        {item.title}
                      </Link>
                    ))}
                  </CollapsibleContent>
                </Collapsible>

                <Link
                  href="/history"
                  className={cn(
                    "py-3 px-4 text-base font-medium rounded-xl transition-all flex items-center",
                    isActive("/history")
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <History className="mr-3 h-5 w-5" />
                  History
                </Link>

                <Link
                  href="/settings"
                  className={cn(
                    "py-3 px-4 text-base font-medium rounded-xl transition-all flex items-center",
                    isActive("/settings")
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <Settings className="mr-3 h-5 w-5" />
                  Settings
                </Link>

                {/* GitHub Link */}
                <Link
                  href="https://github.com/jhn322/chess-next"
                  className="py-3 px-4 text-base font-medium rounded-xl hover:bg-accent hover:text-accent-foreground transition-all flex items-center mt-2"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsOpen(false)}
                >
                  <icons.Github className="h-5 w-5 mr-3" />
                  <span>GitHub</span>
                </Link>

                <div className="pt-6 mt-4 border-t">
                  <Button
                    onClick={() => {
                      setIsLoggedIn(!isLoggedIn);
                      setIsOpen(false);
                    }}
                    className="w-full text-base py-6 flex items-center justify-center rounded-xl shadow-md"
                  >
                    {isLoggedIn ? (
                      <>
                        <LogOut className="mr-2 h-5 w-5" /> Logout
                      </>
                    ) : (
                      <>
                        <LogIn className="mr-2 h-5 w-5" /> Login
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
