"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
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
  Home,
  Play,
  Github,
  Save,
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
import { useAuth } from "@/context/auth-context";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { STORAGE_KEY, DEFAULT_STATE } from "@/config/game";
import Clock from "./Clock";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlayOpen, setIsPlayOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showSavedGameDialog, setShowSavedGameDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(
    null
  );
  const [savedGameDifficulty, setSavedGameDifficulty] = useState<string | null>(
    null
  );
  const { setTheme, theme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const { status, signIn, signOut } = useAuth();
  const isAuthenticated = status === "authenticated";

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

  // Check for saved game on mount and pathname change
  useEffect(() => {
    const checkSavedGame = () => {
      try {
        const savedState = JSON.parse(
          localStorage.getItem(STORAGE_KEY) || "null"
        );
        if (savedState?.fen && savedState.fen !== DEFAULT_STATE.fen) {
          setSavedGameDifficulty(savedState.difficulty);
        } else {
          setSavedGameDifficulty(null);
        }
      } catch (error) {
        console.error("Error checking saved game:", error);
        setSavedGameDifficulty(null);
      }
    };

    checkSavedGame();
  }, [pathname]);

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

  const handleProtectedNavigation = async (path: string) => {
    if (isAuthenticated) {
      await router.push(path);
    } else {
      await signIn("google", `${window.location.origin}${path}`);
    }
    setIsOpen(false); // Close mobile menu if open
  };

  const handlePlayNavigation = (href: string, difficulty: string) => {
    const savedState = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    const hasSavedGame =
      savedState?.fen && savedState.fen !== DEFAULT_STATE.fen;

    if (hasSavedGame && savedState.difficulty !== difficulty) {
      setPendingNavigation(href);
      setShowSavedGameDialog(true);
    } else {
      router.push(href);
    }
  };

  const handleConfirmNavigation = () => {
    if (pendingNavigation) {
      localStorage.removeItem(STORAGE_KEY);
      router.push(pendingNavigation);
    }
    setShowSavedGameDialog(false);
    setPendingNavigation(null);
  };

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-all duration-300",
        scrolled
          ? "border-border/30 bg-background/80 backdrop-blur-lg"
          : "border-border bg-background"
      )}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
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
          <div className="hidden lg:flex lg:items-center lg:gap-6">
            <NavigationMenu>
              <NavigationMenuList>
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
                    <Play className="mr-2 h-4 w-4" />
                    Play
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] grid-cols-2 gap-3 p-4 rounded-xl">
                      {playItems.map((item) => (
                        <li key={item.href}>
                          <button
                            onClick={() =>
                              handlePlayNavigation(
                                item.href,
                                item.title.toLowerCase()
                              )
                            }
                            className={cn(
                              "block w-full select-none rounded-xl p-3 text-base font-medium transition-all hover:scale-[1.02]",
                              isActive(item.href)
                                ? `${item.bgColor} ${item.borderColor} border`
                                : "hover:bg-accent hover:text-accent-foreground"
                            )}
                          >
                            <span className="flex items-center gap-2">
                              <div
                                className={cn("p-1.5 rounded-lg", item.bgColor)}
                              >
                                <item.icon
                                  className={`h-4 w-4 ${item.color}`}
                                />
                              </div>
                              <span className="flex-1">{item.title}</span>
                              {savedGameDifficulty?.toLowerCase() ===
                                item.title.toLowerCase() && (
                                <Badge variant="secondary" className="ml-2">
                                  <Save className="h-3 w-3 mr-1" />
                                  Saved
                                </Badge>
                              )}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {isAuthenticated && (
                  <>
                    <NavigationMenuItem>
                      <Button
                        variant="ghost"
                        onClick={() => handleProtectedNavigation("/history")}
                        className={cn(
                          "px-4 py-2 text-base font-medium rounded-xl transition-colors inline-flex items-center hover:bg-accent hover:text-accent-foreground",
                          isActive("/history")
                            ? "bg-primary/10 text-primary"
                            : ""
                        )}
                      >
                        <History className="mr-2 h-4 w-4" />
                        History
                      </Button>
                    </NavigationMenuItem>

                    <NavigationMenuItem>
                      <Button
                        variant="ghost"
                        onClick={() => handleProtectedNavigation("/settings")}
                        className={cn(
                          "px-4 py-2 text-base font-medium rounded-xl transition-colors inline-flex items-center hover:bg-accent hover:text-accent-foreground",
                          isActive("/settings")
                            ? "bg-primary/10 text-primary"
                            : ""
                        )}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Button>
                    </NavigationMenuItem>
                  </>
                )}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Theme Toggle and Login */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:block">
              <Clock />
            </div>
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

            {isAuthenticated ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="text-base px-5 py-2 h-10 inline-flex items-center rounded-xl shadow-md hover:shadow-lg transition-all">
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you sure you want to logout?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      You will be signed out of your account and redirected to
                      the home page.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-lg">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={signOut} className="rounded-lg">
                      Logout
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <>
                <Button
                  onClick={() => signIn("google")}
                  className="text-base px-5 py-2 h-10 inline-flex items-center rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                  <LogIn className="mr-2 h-4 w-4" /> Login
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <div className="lg:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-xl"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-full sm:w-[350px] p-0 bg-background/80 backdrop-blur-lg"
              >
                <div className="flex flex-col h-full">
                  <SheetHeader className="p-6 border-b">
                    <div className="flex items-center space-x-3">
                      <div className="relative w-9 h-9 flex-shrink-0 bg-primary/10 rounded-xl p-1.5">
                        <Image
                          src="/favicon.svg"
                          alt="Pawn Icon"
                          style={{ objectFit: "contain" }}
                          width={40}
                          height={40}
                          className="drop-shadow-md"
                        />
                      </div>
                      <span className="font-bold text-xl tracking-tight whitespace-nowrap">
                        NextMove
                      </span>
                    </div>
                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                    <SheetDescription className="sr-only">
                      Navigate through NextMove application
                    </SheetDescription>
                  </SheetHeader>

                  <div className="flex-1 overflow-auto py-4">
                    <div className="flex flex-col space-y-1 px-4">
                      <Link
                        href="/"
                        className={cn(
                          "px-4 py-3 text-base font-medium rounded-xl transition-colors flex items-center",
                          isActive("/")
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-accent hover:text-accent-foreground"
                        )}
                        onClick={() => setIsOpen(false)}
                      >
                        <Home className="mr-3 h-5 w-5" />
                        <span>Home</span>
                      </Link>

                      <Collapsible
                        open={isPlayOpen}
                        onOpenChange={setIsPlayOpen}
                        className="w-full"
                      >
                        <CollapsibleTrigger
                          className={cn(
                            "w-full px-4 py-3 text-base font-medium rounded-xl transition-colors flex items-center justify-between",
                            pathname.startsWith("/play")
                              ? "bg-primary/10 text-primary"
                              : "hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          <div className="flex items-center">
                            <Play className="mr-3 h-5 w-5" />
                            <span>Play</span>
                          </div>
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 transition-transform duration-200",
                              isPlayOpen ? "rotate-180" : ""
                            )}
                          />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-1 space-y-1">
                          {playItems.map((item) => (
                            <button
                              key={item.href}
                              onClick={() => {
                                handlePlayNavigation(
                                  item.href,
                                  item.title.toLowerCase()
                                );
                                setIsOpen(false);
                              }}
                              className={cn(
                                "block w-full px-4 py-3 text-base font-medium rounded-xl transition-colors ml-4",
                                isActive(item.href)
                                  ? `${item.bgColor} ${item.borderColor} border`
                                  : "hover:bg-accent hover:text-accent-foreground"
                              )}
                            >
                              <span className="flex items-center gap-3">
                                <div
                                  className={cn(
                                    "p-1.5 rounded-lg flex-shrink-0",
                                    item.bgColor
                                  )}
                                >
                                  <item.icon
                                    className={`h-5 w-5 ${item.color}`}
                                  />
                                </div>
                                <span className="flex-1 text-left">
                                  {item.title}
                                </span>
                                {savedGameDifficulty?.toLowerCase() ===
                                  item.title.toLowerCase() && (
                                  <Badge
                                    variant="secondary"
                                    className="ml-2 flex-shrink-0"
                                  >
                                    <Save className="h-3 w-3 mr-1" />
                                    Saved
                                  </Badge>
                                )}
                              </span>
                            </button>
                          ))}
                        </CollapsibleContent>
                      </Collapsible>

                      {isAuthenticated && (
                        <>
                          <button
                            onClick={() =>
                              handleProtectedNavigation("/history")
                            }
                            className={cn(
                              "w-full px-4 py-3 text-base font-medium rounded-xl transition-colors flex items-center justify-start",
                              isActive("/history")
                                ? "bg-primary/10 text-primary"
                                : "hover:bg-accent hover:text-accent-foreground"
                            )}
                          >
                            <History className="mr-3 h-5 w-5" />
                            <span>History</span>
                          </button>

                          <button
                            onClick={() =>
                              handleProtectedNavigation("/settings")
                            }
                            className={cn(
                              "w-full px-4 py-3 text-base font-medium rounded-xl transition-colors flex items-center justify-start",
                              isActive("/settings")
                                ? "bg-primary/10 text-primary"
                                : "hover:bg-accent hover:text-accent-foreground"
                            )}
                          >
                            <Settings className="mr-3 h-5 w-5" />
                            <span>Settings</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="p-6 border-t w-full">
                    <div className="flex flex-col space-y-4">
                      <div className="flex items-center justify-between w-3/4 mx-auto">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-9 w-9 rounded-lg"
                            >
                              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                              <span className="sr-only">Toggle theme</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-36">
                            <DropdownMenuItem
                              onClick={() => setTheme("light")}
                              className={cn(
                                "cursor-pointer",
                                theme === "light" ? "bg-accent" : ""
                              )}
                            >
                              <Sun className="mr-2 h-4 w-4" />
                              <span>Light</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setTheme("dark")}
                              className={cn(
                                "cursor-pointer",
                                theme === "dark" ? "bg-accent" : ""
                              )}
                            >
                              <Moon className="mr-2 h-4 w-4" />
                              <span>Dark</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setTheme("system")}
                              className={cn(
                                "cursor-pointer",
                                theme === "system" ? "bg-accent" : ""
                              )}
                            >
                              <Laptop className="mr-2 h-4 w-4" />
                              <span>System</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <Link
                          href="https://github.com/jhn322/chess-next"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                        >
                          <Github className="h-[1.2rem] w-[1.2rem]" />
                          <span className="sr-only">GitHub Repository</span>
                        </Link>

                        {isAuthenticated ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button className="h-9 px-4 py-2 inline-flex items-center justify-center rounded-lg">
                                <LogOut className="mr-2 h-4 w-4" /> Logout
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-xl">
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you sure you want to logout?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  You will be signed out of your account and
                                  redirected to the home page.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-lg">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={signOut}
                                  className="rounded-lg"
                                >
                                  Logout
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : (
                          <>
                            <Button
                              onClick={() => signIn("google")}
                              className="h-9 px-4 py-2 inline-flex items-center justify-center rounded-lg"
                            >
                              <LogIn className="mr-2 h-4 w-4" /> Login
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* AlertDialog for saved game warning */}
      <AlertDialog
        open={showSavedGameDialog}
        onOpenChange={setShowSavedGameDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Saved Game Found</AlertDialogTitle>
            <AlertDialogDescription>
              You have a saved game in progress at {savedGameDifficulty}{" "}
              difficulty. Starting a new game at a different difficulty will
              delete your saved progress.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowSavedGameDialog(false);
                setPendingNavigation(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmNavigation}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </nav>
  );
};

export default Navbar;
