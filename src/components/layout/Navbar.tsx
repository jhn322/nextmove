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
  Flower2,
  Flame,
  Leaf,
  Zap,
  Sparkles,
  Brush,
  Ghost,
  CircleDot,
  Heart,
  Wand2,
  Trophy as TrophyIcon,
  Monitor,
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
      eloRange: "800-1000",
      playStyle: "Random",
    },
    {
      title: "Easy",
      href: "/play/easy",
      icon: Gamepad2,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20",
      eloRange: "1000-1200",
      playStyle: "Aggressive",
    },
    {
      title: "Intermediate",
      href: "/play/intermediate",
      icon: BookOpen,
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/20",
      eloRange: "1200-1400",
      playStyle: "Balanced",
    },
    {
      title: "Advanced",
      href: "/play/advanced",
      icon: Sword,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
      eloRange: "1400-1600",
      playStyle: "Positional",
    },
    {
      title: "Hard",
      href: "/play/hard",
      icon: Crosshair,
      color: "text-violet-500",
      bgColor: "bg-violet-500/10",
      borderColor: "border-violet-500/20",
      eloRange: "1600-1800",
      playStyle: "Tactical",
    },
    {
      title: "Expert",
      href: "/play/expert",
      icon: Target,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
      eloRange: "1800-2000",
      playStyle: "Dynamic",
    },
    {
      title: "Master",
      href: "/play/master",
      icon: Award,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20",
      eloRange: "2000-2200",
      playStyle: "Strategic",
    },
    {
      title: "Grandmaster",
      href: "/play/grandmaster",
      icon: Trophy,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/20",
      eloRange: "2200-2400",
      playStyle: "Universal",
    },
  ];

  const isActive = (path: string) => pathname === path;

  const handleProtectedNavigation = async (path: string) => {
    if (isAuthenticated) {
      await router.push(path);
    } else {
      await signIn("google", {
        callbackUrl: `${window.location.origin}${path}`,
      });
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

  const themeCategories = [
    {
      category: "System",
      themes: [
        { value: "light", label: "Light", icon: Sun },
        { value: "dark", label: "Dark", icon: Moon },
        { value: "system", label: "System", icon: Laptop },
      ],
    },
    {
      category: "Colors",
      themes: [
        { value: "amber", label: "Amber", icon: CircleDot },
        { value: "amethyst", label: "Amethyst", icon: Flower2 },
        { value: "crimson", label: "Crimson", icon: Flame },
        { value: "jade", label: "Jade", icon: Leaf },
        { value: "midnight", label: "Midnight", icon: Sparkles },
        { value: "rose", label: "Rose", icon: Heart },
      ],
    },
    {
      category: "Special",
      themes: [
        { value: "cyberpunk", label: "Cyberpunk", icon: Zap },
        { value: "classic", label: "Classic", icon: Monitor },
        { value: "comic", label: "Comic", icon: Brush },
        { value: "dracula", label: "Dracula", icon: Ghost },
        { value: "fantasy", label: "Fantasy", icon: Wand2 },
        { value: "pokemon", label: "Pokemon", icon: TrophyIcon },
      ],
    },
  ];

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
                  priority
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
                    <div className="w-[500px] p-4 md:w-[600px]">
                      <div className="grid grid-cols-2 gap-4">
                        {playItems.map((item) => (
                          <button
                            key={item.href}
                            onClick={() =>
                              handlePlayNavigation(
                                item.href,
                                item.title.toLowerCase()
                              )
                            }
                            className={cn(
                              "relative flex flex-col space-y-2 rounded-xl p-3 text-left transition-colors hover:bg-accent/50",
                              isActive(item.href)
                                ? `${item.bgColor} ${item.borderColor} border shadow-sm`
                                : "hover:shadow-sm"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={cn(
                                  "flex h-10 w-10 items-center justify-center rounded-lg",
                                  item.bgColor
                                )}
                              >
                                <item.icon
                                  className={cn("h-5 w-5", item.color)}
                                />
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium leading-none">
                                    {item.title}
                                  </span>
                                  {savedGameDifficulty?.toLowerCase() ===
                                    item.title.toLowerCase() && (
                                    <Badge
                                      variant="secondary"
                                      className="bg-green-500 animate-pulse"
                                    >
                                      <Save className="h-3 w-3" />
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span className={item.color}>
                                    {item.eloRange} ELO
                                  </span>
                                  <span>•</span>
                                  <span>{item.playStyle}</span>
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
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
            <div className="hidden lg:block">
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
                <DropdownMenuContent
                  align="end"
                  className="w-56 p-1.5 rounded-xl dropdown-menu-content"
                >
                  {themeCategories.map((category, index) => (
                    <React.Fragment key={category.category}>
                      {index > 0 && <div className="h-px bg-border my-0.5" />}
                      <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
                        {category.category}
                      </div>
                      <div className="grid grid-cols-3 gap-0.5">
                        {category.themes.map((option) => (
                          <DropdownMenuItem
                            key={option.value}
                            onClick={() => setTheme(option.value)}
                            className={cn(
                              "py-1 px-1.5 rounded-lg cursor-pointer flex flex-col items-center justify-center h-14 dropdown-menu-item",
                              theme === option.value
                                ? option.value === "cyberpunk"
                                  ? "bg-[#ff00ff]/70"
                                  : option.value === "comic"
                                  ? "bg-[#ff6b9c]/70"
                                  : "bg-accent/80"
                                : "hover:bg-accent/40"
                            )}
                          >
                            <div className="flex items-center justify-center mb-0.5 dropdown-theme-icon">
                              <option.icon className="h-5 w-5" />
                            </div>
                            <span className="text-xs">{option.label}</span>
                          </DropdownMenuItem>
                        ))}
                      </div>
                    </React.Fragment>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {isAuthenticated ? (
              <div className="hidden lg:block">
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
                      <AlertDialogAction
                        onClick={() => signOut()}
                        className="rounded-lg"
                      >
                        Logout
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ) : (
              <>
                <Button
                  onClick={() => router.push("/auth/login")}
                  className="hidden lg:inline-flex text-base px-5 py-2 h-10 items-center rounded-xl shadow-md hover:shadow-lg transition-all"
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
                          priority
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
                                "w-full rounded-xl p-3 transition-colors",
                                isActive(item.href)
                                  ? `${item.bgColor} ${item.borderColor} border shadow-sm`
                                  : "hover:bg-accent/50 hover:shadow-sm"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={cn(
                                    "flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg",
                                    item.bgColor
                                  )}
                                >
                                  <item.icon
                                    className={cn("h-6 w-6", item.color)}
                                  />
                                </div>
                                <div className="flex-1 space-y-1 text-left">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">
                                      {item.title}
                                    </span>
                                    {savedGameDifficulty?.toLowerCase() ===
                                      item.title.toLowerCase() && (
                                      <Badge
                                        variant="secondary"
                                        className="bg-green-500 animate-pulse"
                                      >
                                        <Save className="h-3 w-3" />
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span className={item.color}>
                                      {item.eloRange} ELO
                                    </span>
                                    <span>•</span>
                                    <span>{item.playStyle}</span>
                                  </div>
                                </div>
                              </div>
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
                          <DropdownMenuContent
                            align="end"
                            className="w-56 p-1.5 rounded-xl dropdown-menu-content"
                          >
                            {themeCategories.map((category, index) => (
                              <React.Fragment key={category.category}>
                                {index > 0 && (
                                  <div className="h-px bg-border my-0.5" />
                                )}
                                <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
                                  {category.category}
                                </div>
                                <div className="grid grid-cols-3 gap-0.5">
                                  {category.themes.map((option) => (
                                    <DropdownMenuItem
                                      key={option.value}
                                      onClick={() => setTheme(option.value)}
                                      className={cn(
                                        "py-1 px-1.5 rounded-lg cursor-pointer flex flex-col items-center justify-center h-14 dropdown-menu-item",
                                        theme === option.value
                                          ? option.value === "cyberpunk"
                                            ? "bg-[#ff00ff]/70"
                                            : option.value === "comic"
                                            ? "bg-[#ff6b9c]/70"
                                            : "bg-accent/80"
                                          : "hover:bg-accent/40"
                                      )}
                                    >
                                      <div className="flex items-center justify-center mb-0.5 dropdown-theme-icon">
                                        <option.icon className="h-5 w-5" />
                                      </div>
                                      <span className="text-xs">
                                        {option.label}
                                      </span>
                                    </DropdownMenuItem>
                                  ))}
                                </div>
                              </React.Fragment>
                            ))}
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
                                  onClick={() => signOut()}
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
                              onClick={() => {
                                router.push("/auth/login");
                                setIsOpen(false);
                              }}
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
