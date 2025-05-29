"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { APP_NAME } from "@/lib/constants/site";
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
  Blocks,
  BookOpen,
  Sword,
  Crosshair,
  Swords,
  Trophy,
  Award,
  ChevronDown,
  Home,
  Play,
  Github,
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
  Loader2,
  Dice5,
  Shield,
  Move,
  AudioLines,
  Omega,
  Brain,
  Target,
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
  const [showGameInProgressDialog, setShowGameInProgressDialog] =
    useState(false);
  const [pendingNavigationHref, setPendingNavigationHref] = useState<
    string | null
  >(null);
  const [activeGameDifficultyInNavbar, setActiveGameDifficultyInNavbar] =
    useState<string | null>(null);
  const [navigatingToPlayItem, setNavigatingToPlayItem] = useState<
    string | null
  >(null);
  const { setTheme, theme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const { status, signIn, signOut } = useAuth();
  const isAuthenticated = status === "authenticated";

  // Memoize last known authenticated state to prevent auth paths flicker when game is finished
  const [wasAuthenticated, setWasAuthenticated] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isSettingsLoading, setIsSettingsLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") setWasAuthenticated(true);
    if (status === "unauthenticated") setWasAuthenticated(false);
  }, [status]);
  const showAuthLinks =
    isAuthenticated || (status === "loading" && wasAuthenticated);

  // Reset loading spinners on route change
  useEffect(() => {
    setIsHistoryLoading(false);
    setIsSettingsLoading(false);
  }, [pathname]);

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
          setActiveGameDifficultyInNavbar(
            savedState.difficulty?.toLowerCase() || null
          );
        } else {
          setActiveGameDifficultyInNavbar(null);
        }
      } catch (error) {
        console.error("Error checking saved game in Navbar:", error);
        setActiveGameDifficultyInNavbar(null);
      }
    };

    checkSavedGame();
  }, [pathname]);

  // Reset spinner on pathname change
  useEffect(() => {
    if (navigatingToPlayItem) {
      setNavigatingToPlayItem(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const playItems = [
    {
      title: "Beginner",
      href: "/play/beginner",
      icon: Baby,
      color: "difficulty-beginner-text",
      bgColor: "difficulty-beginner-bg",
      borderColor: "difficulty-beginner-border",
      eloRange: "200-300",
      playStyle: "Random",
      styleIcon: Dice5,
    },
    {
      title: "Easy",
      href: "/play/easy",
      icon: Blocks,
      color: "difficulty-easy-text",
      bgColor: "difficulty-easy-bg",
      borderColor: "difficulty-easy-border",
      eloRange: "320-400",
      playStyle: "Aggressive",
      styleIcon: Zap,
    },
    {
      title: "Intermediate",
      href: "/play/intermediate",
      icon: BookOpen,
      color: "difficulty-intermediate-text",
      bgColor: "difficulty-intermediate-bg",
      borderColor: "difficulty-intermediate-border",
      eloRange: "450-600",
      playStyle: "Balanced",
      styleIcon: Shield,
    },
    {
      title: "Advanced",
      href: "/play/advanced",
      icon: Crosshair,
      color: "difficulty-advanced-text",
      bgColor: "difficulty-advanced-bg",
      borderColor: "difficulty-advanced-border",
      eloRange: "650-800",
      playStyle: "Positional",
      styleIcon: Move,
    },
    {
      title: "Hard",
      href: "/play/hard",
      icon: Sword,
      color: "difficulty-hard-text",
      bgColor: "difficulty-hard-bg",
      borderColor: "difficulty-hard-border",
      eloRange: "850-1000",
      playStyle: "Tactical",
      styleIcon: AudioLines,
    },
    {
      title: "Expert",
      href: "/play/expert",
      icon: Swords,
      color: "difficulty-expert-text",
      bgColor: "difficulty-expert-bg",
      borderColor: "difficulty-expert-border",
      eloRange: "1100-1600",
      playStyle: "Dynamic",
      styleIcon: Omega,
    },
    {
      title: "Master",
      href: "/play/master",
      icon: Award,
      color: "difficulty-master-text",
      bgColor: "difficulty-master-bg",
      borderColor: "difficulty-master-border",
      eloRange: "1700-2300",
      playStyle: "Strategic",
      styleIcon: Brain,
    },
    {
      title: "Grandmaster",
      href: "/play/grandmaster",
      icon: Trophy,
      color: "difficulty-grandmaster-text",
      bgColor: "difficulty-grandmaster-bg",
      borderColor: "difficulty-grandmaster-border",
      eloRange: "2400-3000",
      playStyle: "Universal",
      styleIcon: Target,
    },
  ];

  const isActive = (path: string) => pathname === path;

  const handleProtectedNavigation = async (path: string) => {
    if (isAuthenticated) {
      if (path === "/history") setIsHistoryLoading(true);
      if (path === "/settings") setIsSettingsLoading(true);
      await router.push(path);
    } else {
      await signIn("google", {
        callbackUrl: `${window.location.origin}${path}`,
      });
    }
    setIsOpen(false); // Close mobile menu if open
  };

  const handlePlayMenuItemClick = (href: string, itemDifficulty: string) => {
    const lowercasedItemDifficulty = itemDifficulty.toLowerCase();
    if (
      activeGameDifficultyInNavbar &&
      activeGameDifficultyInNavbar !== lowercasedItemDifficulty
    ) {
      setPendingNavigationHref(href);
      setShowGameInProgressDialog(true);
    } else {
      setNavigatingToPlayItem(href);
      router.push(href);
    }
    if (isOpen) setIsOpen(false);
  };

  const handleConfirmNewGameNavigation = () => {
    if (pendingNavigationHref) {
      localStorage.removeItem(STORAGE_KEY);
      setActiveGameDifficultyInNavbar(null);
      setNavigatingToPlayItem(pendingNavigationHref);
      router.push(pendingNavigationHref);
    }
    setShowGameInProgressDialog(false);
    setPendingNavigationHref(null);
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
              <div className="relative w-10 h-10 flex-shrink-0 bg-primary/10 rounded-lg p-1.5 group-hover:scale-105 transition-transform">
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
                {APP_NAME}
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
                      "px-4 py-2 text-base font-medium rounded-lg transition-colors inline-flex items-center",
                      "h-10",
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
                      "text-base font-medium px-4 py-2 rounded-lg",
                      "h-10",
                      "inline-flex items-center",
                      "hover:bg-accent hover:text-accent-foreground",
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
                              handlePlayMenuItemClick(item.href, item.title)
                            }
                            className={cn(
                              "relative flex flex-col space-y-2 rounded-lg p-3 text-left transition-colors hover:bg-accent/50",
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
                                  {navigatingToPlayItem === item.href ? (
                                    <Loader2 className="h-4 w-4 animate-spin ml-2" />
                                  ) : activeGameDifficultyInNavbar ===
                                    item.title.toLowerCase() ? (
                                    <Badge
                                      variant="secondary"
                                      className="bg-green-500 text-white animate-pulse"
                                    >
                                      In Progress
                                    </Badge>
                                  ) : null}
                                </div>
                                {navigatingToPlayItem !== item.href && (
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span className={item.color}>
                                      {item.eloRange} ELO
                                    </span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                      {item.styleIcon && (
                                        <item.styleIcon
                                          className={`h-3.5 w-3.5 ${item.color}`}
                                          aria-hidden="true"
                                          focusable="false"
                                        />
                                      )}
                                      {item.playStyle}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {showAuthLinks && (
                  <>
                    <NavigationMenuItem>
                      <Button
                        variant="ghost"
                        onClick={() => handleProtectedNavigation("/history")}
                        className={cn(
                          "px-4 py-2 text-base font-medium transition-colors inline-flex items-center hover:bg-accent hover:text-accent-foreground",
                          "h-10",
                          isActive("/history")
                            ? "bg-primary/10 text-primary"
                            : ""
                        )}
                        disabled={isHistoryLoading}
                      >
                        {isHistoryLoading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <History className="mr-2 h-4 w-4" />
                        )}
                        <span>History</span>
                      </Button>
                    </NavigationMenuItem>

                    <NavigationMenuItem>
                      <Button
                        variant="ghost"
                        onClick={() => handleProtectedNavigation("/settings")}
                        className={cn(
                          "px-4 py-2 text-base font-medium transition-colors inline-flex items-center hover:bg-accent hover:text-accent-foreground",
                          "h-10",
                          isActive("/settings")
                            ? "bg-primary/10 text-primary"
                            : ""
                        )}
                        disabled={isSettingsLoading}
                      >
                        {isSettingsLoading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Settings className="mr-2 h-4 w-4" />
                        )}
                        <span>Settings</span>
                      </Button>
                    </NavigationMenuItem>
                  </>
                )}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Theme Toggle and Sign In */}
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
                    className="h-10 w-10 border-border/50 bg-background/50 backdrop-blur-sm hover:bg-accent/50 transition-colors"
                  >
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 p-1.5 rounded-lg dropdown-menu-content"
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

            {showAuthLinks ? (
              <div className="hidden lg:block">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="text-base px-5 py-2 h-10 inline-flex items-center shadow-md hover:shadow-lg transition-all">
                      <LogOut className="mr-2 h-4 w-4" /> Sign Out
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-lg">
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you sure you want to sign out?
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
                        Log Out
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ) : (
              <>
                <Button
                  onClick={() => router.push("/auth/login")}
                  className="hidden lg:inline-flex text-base px-5 py-2 h-10 items-center shadow-md hover:shadow-lg transition-all"
                >
                  <LogIn className="mr-2 h-4 w-4" /> Sign In
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Trigger & Mobile Auth Button */}
          <div className="flex items-center gap-2 lg:hidden">
            {showAuthLinks ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="text-base px-4 py-2 h-10 inline-flex items-center shadow-sm hover:shadow-md transition-all">
                    <LogOut className="mr-2 h-4 w-4" /> Sign Out
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-lg">
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you sure you want to sign out?
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
                      Log Out
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <Button
                onClick={() => router.push("/auth/login")}
                className="text-base px-4 py-2 h-10 inline-flex items-center shadow-sm hover:shadow-md transition-all"
              >
                <LogIn className="mr-2 h-4 w-4" /> Sign In
              </Button>
            )}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-10 w-10">
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
                      <div className="relative w-9 h-9 flex-shrink-0 bg-primary/10 rounded-lg p-1.5">
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
                        {APP_NAME}
                      </span>
                    </div>
                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                    <SheetDescription className="sr-only">
                      Navigate through {APP_NAME} application
                    </SheetDescription>
                  </SheetHeader>

                  <div className="flex-1 overflow-auto py-4">
                    <div className="flex flex-col space-y-1 px-4">
                      <Link
                        href="/"
                        className={cn(
                          "px-4 py-3 text-base font-medium rounded-lg transition-colors flex items-center",
                          "h-10",
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
                            "w-full px-4 py-3 text-base font-medium rounded-lg transition-colors flex items-center justify-between",
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
                                handlePlayMenuItemClick(item.href, item.title);
                                setIsOpen(false);
                              }}
                              className={cn(
                                "w-full rounded-lg p-3 transition-colors",
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
                                    {navigatingToPlayItem === item.href ? (
                                      <Loader2 className="h-4 w-4 animate-spin ml-2" />
                                    ) : activeGameDifficultyInNavbar ===
                                      item.title.toLowerCase() ? (
                                      <Badge
                                        variant="secondary"
                                        className="bg-green-500 text-white animate-pulse"
                                      >
                                        In Progress
                                      </Badge>
                                    ) : null}
                                  </div>
                                  {navigatingToPlayItem !== item.href && (
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <span className={item.color}>
                                        {item.eloRange} ELO
                                      </span>
                                      <span>•</span>
                                      <span className="flex items-center gap-1">
                                        {item.styleIcon && (
                                          <item.styleIcon
                                            className={`h-3.5 w-3.5 ${item.color}`}
                                            aria-hidden="true"
                                            focusable="false"
                                          />
                                        )}
                                        {item.playStyle}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </button>
                          ))}
                        </CollapsibleContent>
                      </Collapsible>

                      {showAuthLinks && (
                        <>
                          <Button
                            onClick={() =>
                              handleProtectedNavigation("/history")
                            }
                            className={cn(
                              "w-full px-4 py-3 text-base font-medium transition-colors flex items-center justify-start",
                              isActive("/history")
                                ? "bg-primary/10 text-primary"
                                : "hover:bg-accent hover:text-accent-foreground"
                            )}
                          >
                            <History className="mr-3 h-5 w-5" />
                            <span>History</span>
                          </Button>

                          <Button
                            onClick={() =>
                              handleProtectedNavigation("/settings")
                            }
                            className={cn(
                              "w-full px-4 py-3 text-base font-medium transition-colors flex items-center justify-start",
                              isActive("/settings")
                                ? "bg-primary/10 text-primary"
                                : "hover:bg-accent hover:text-accent-foreground"
                            )}
                          >
                            <Settings className="mr-3 h-5 w-5" />
                            <span>Settings</span>
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="p-6 border-t w-full">
                    <div className="flex flex-col space-y-4">
                      <div className="flex items-center justify-center gap-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-9 w-9"
                            >
                              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                              <span className="sr-only">Toggle theme</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-56 p-1.5 rounded-lg dropdown-menu-content"
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

                        {showAuthLinks ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button className="h-9 px-4 py-2 inline-flex items-center justify-center">
                                <LogOut className="mr-2 h-4 w-4" /> Sign Out
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-lg">
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you sure you want to sign out?
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
                                  Log Out
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
                              className="h-9 px-4 py-2 inline-flex items-center justify-center"
                            >
                              <LogIn className="mr-2 h-4 w-4" /> Sign In
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
        open={showGameInProgressDialog}
        onOpenChange={setShowGameInProgressDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Game In Progress</AlertDialogTitle>
            <AlertDialogDescription>
              You have a game in progress with{" "}
              {activeGameDifficultyInNavbar && (
                <strong className="capitalize">
                  {activeGameDifficultyInNavbar}
                </strong>
              )}{" "}
              difficulty. Starting a new game at a different difficulty will
              erase your current game progress. Are you sure?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowGameInProgressDialog(false);
                setPendingNavigationHref(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmNewGameNavigation}>
              Continue & Start New
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </nav>
  );
};

export default Navbar;
