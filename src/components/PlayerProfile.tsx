"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Check,
  Pencil,
  BarChart3,
  Gamepad2,
  TrendingUp,
  Trophy,
  ShieldX,
  MinusSquare,
  ChevronRight,
  Loader2,
  Flag,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import Image from "next/image";
import HoverText from "@/components/ui/hover-text";
import { getCharacterNameFromPath } from "@/lib/utils";
import Link from "next/link";
import EloBadge from "@/components/ui/elo-badge";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import dynamic from "next/dynamic";

interface PlayerProfileProps {
  className?: string;
  totalGames?: number;
  winRate?: number;
  wins?: number;
  losses?: number;
  draws?: number;
  resigns?: number;
}

const VirtualizedAvatarGrid = dynamic(
  () => import("@/components/ui/virtualized-avatar-grid"),
  { ssr: false }
);

export default function PlayerProfile({
  className,
  totalGames,
  winRate,
  wins,
  losses,
  draws,
  resigns,
}: PlayerProfileProps) {
  const { session, status, refreshSession } = useAuth();
  const [playerName, setPlayerName] = useState<string>("Player");
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("/avatars/jake.webp");
  const [countryFlag, setCountryFlag] = useState<string>("");
  const [flair, setFlair] = useState<string>("");
  const [availableAvatars, setAvailableAvatars] = useState<string[]>([]);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isNavigatingToHistory, setIsNavigatingToHistory] = useState(false);

  // Load player data from session
  useEffect(() => {
    setIsLoading(true);
    if (status === "authenticated" && session?.user) {
      const user = session.user;
      setPlayerName(user.name || "Player");
      setInputValue(user.name || "Player");
      setAvatarUrl(user.image || "/avatars/jake.webp");
      setCountryFlag(user.countryFlag || "");
      setFlair(user.flair || "");
      setIsLoading(false);
    } else if (status === "unauthenticated") {
      // Reset to defaults if logged out
      setPlayerName("Player");
      setInputValue("Player");
      setAvatarUrl("/avatars/jake.webp");
      setCountryFlag("");
      setFlair("");
      setIsLoading(false);
    }
    // Add session.user as dependency
  }, [session?.user, status]);

  // Load available avatars
  useEffect(() => {
    const avatars = [
      "/avatars/aang.webp",
      "/avatars/bart.webp",
      "/avatars/bender.webp",
      "/avatars/benson.webp",
      "/avatars/blossom.webp",
      "/avatars/bojack.webp",
      "/avatars/bubbles.webp",
      "/avatars/bubblegum.webp",
      "/avatars/buttercup.webp",
      "/avatars/catdog.webp",
      "/avatars/courage.webp",
      "/avatars/darwin.webp",
      "/avatars/deedee.webp",
      "/avatars/dexter.webp",
      "/avatars/dipper.webp",
      "/avatars/ed.webp",
      "/avatars/edd.webp",
      "/avatars/eddy.webp",
      "/avatars/finn.webp",
      "/avatars/flame.webp",
      "/avatars/gir.webp",
      "/avatars/grim.webp",
      "/avatars/gumball.webp",
      "/avatars/homer.webp",
      "/avatars/jake.webp",
      "/avatars/jerry.webp",
      "/avatars/jimmy.webp",
      "/avatars/johnny.webp",
      "/avatars/marceline.webp",
      "/avatars/mordecai.webp",
      "/avatars/morty.webp",
      "/avatars/patrick.webp",
      "/avatars/perry.webp",
      "/avatars/peter.webp",
      "/avatars/rick.webp",
      "/avatars/rigby.webp",
      "/avatars/samurai.webp",
      "/avatars/sandy.webp",
      "/avatars/scooby.webp",
      "/avatars/shaggy.webp",
      "/avatars/skips.webp",
      "/avatars/spongebob.webp",
      "/avatars/squidward.webp",
      "/avatars/stewie.webp",
      "/avatars/timmy.webp",
      "/avatars/tom.webp",
      "/avatars/wendy.webp",
      "/avatars/zim.webp",
    ];

    setAvailableAvatars(avatars);
  }, []);

  const handleEditClick = () => {
    setIsEditing(true);
    setInputValue(playerName);
  };

  const handleSaveName = async () => {
    if (!session?.user?.id || !inputValue.trim()) return;

    setIsLoading(true);
    const newName = inputValue.trim();
    setPlayerName(newName);

    try {
      // Call the API endpoint to save the name
      const response = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newName }),
      });

      if (!response.ok) {
        // Revert optimistic update on error
        setPlayerName(session.user.name || "Player");
        console.error("Failed to save name:", await response.text());
        // TODO: Show error message to user
      } else {
        // Refresh session to get updated user info
        await refreshSession();
      }
    } catch (error) {
      // Revert optimistic update on error
      setPlayerName(session.user.name || "Player");
      console.error("Unexpected error saving name:", error);
      // TODO: Show error message to user
    } finally {
      setIsLoading(false);
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveName();
    } else if (e.key === "Escape") {
      setIsEditing(false);
    }
  };

  const handleAvatarSelect = async (avatarPath: string) => {
    if (!session?.user?.id) return;

    const previousAvatar = avatarUrl;
    setAvatarUrl(avatarPath);
    setIsAvatarDialogOpen(false);
    setIsLoading(true);

    try {
      // Call the API endpoint to save the avatar
      const response = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: avatarPath }),
      });

      if (!response.ok) {
        // Revert optimistic update on error
        setAvatarUrl(previousAvatar);
        console.error("Failed to save avatar:", await response.text());
        // TODO: Show error message to user
      } else {
        // Refresh session to get updated user info
        await refreshSession();
      }
    } catch (error) {
      // Revert optimistic update on error
      setAvatarUrl(previousAvatar);
      console.error("Unexpected error saving avatar:", error);
      // TODO: Show error message to user
    } finally {
      setIsLoading(false);
    }
  };

  // If not authenticated or still loading, don't render the component
  if (status === "unauthenticated" || status === "loading") {
    return null;
  }

  // Show loading state for authenticated users only
  if (isLoading) {
    return (
      <Card
        className={`w-full bg-card/80 backdrop-blur-sm border border-border/50 shadow-lg ${className}`}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold">Player Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-muted animate-pulse"></div>
            <div className="flex-1">
              <div className="h-6 w-24 bg-muted animate-pulse rounded"></div>
              <div className="h-4 w-48 bg-muted animate-pulse rounded mt-2"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={`w-full bg-card/80 backdrop-blur-sm border border-border/50 shadow-lg ${className}`}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold">Player Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Dialog
            open={isAvatarDialogOpen}
            onOpenChange={setIsAvatarDialogOpen}
          >
            <DialogTrigger asChild>
              {isAvatarDialogOpen ? (
                <HoverText
                  text={getCharacterNameFromPath(avatarUrl)}
                  side="right"
                >
                  <Button
                    variant="ghost"
                    className="p-0 h-auto rounded-full relative group"
                  >
                    <Avatar className="h-16 w-16 cursor-pointer border-2 border-primary/50 group-hover:border-primary transition-all">
                      <AvatarImage
                        src={avatarUrl}
                        alt={playerName || "Player"}
                      />
                      <AvatarFallback>
                        {(playerName || "P").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Pencil className="h-5 w-5 text-white" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>Edit Avatar</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Button>
                </HoverText>
              ) : (
                <Button
                  variant="ghost"
                  className="p-0 h-auto rounded-full relative group"
                >
                  <Avatar className="h-16 w-16 cursor-pointer border-2 border-primary/50 group-hover:border-primary transition-all">
                    <AvatarImage src={avatarUrl} alt={playerName || "Player"} />
                    <AvatarFallback>
                      {(playerName || "P").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Pencil className="h-5 w-5 text-white" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>Edit Avatar</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Button>
              )}
            </DialogTrigger>
            <DialogContent
              className="rounded-lg overflow-hidden box-border w-full max-w-md"
              aria-describedby="profile-avatar-dialog-description"
            >
              <DialogHeader>
                <DialogTitle>Choose Avatar</DialogTitle>
              </DialogHeader>
              <DialogDescription
                id="profile-avatar-dialog-description"
                className="sr-only"
              >
                Select an avatar to represent you in games
              </DialogDescription>
              <div
                id="profile-avatar-dialog-description"
                className="text-sm text-muted-foreground mb-4"
              >
                Select an avatar to represent you in games
              </div>
              <div className="w-full h-[300px] overflow-y-auto box-border">
                <VirtualizedAvatarGrid
                  availableAvatars={availableAvatars}
                  selectedAvatar={avatarUrl}
                  onSelect={handleAvatarSelect}
                  getCharacterNameFromPath={getCharacterNameFromPath}
                  columnCount={
                    typeof window !== "undefined" && window.innerWidth <= 640
                      ? 3
                      : 4
                  }
                />
              </div>
            </DialogContent>
          </Dialog>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              {isEditing ? (
                <div className="flex w-full gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    maxLength={20}
                    className="h-9"
                  />
                  <Button size="sm" onClick={handleSaveName}>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Check className="h-4 w-4" />
                        </TooltipTrigger>
                        <TooltipContent>Save</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-md font-bold break-words max-w-[10rem] text-ellipsis"
                      title={playerName || "Player"}
                    >
                      {playerName || "Player"}
                    </span>
                    {countryFlag && (
                      <Image
                        src={`/flags/${countryFlag}.webp`}
                        alt={`${countryFlag} flag`}
                        width={20}
                        height={12}
                        className="h-3 w-5"
                        style={{ height: "auto" }}
                      />
                    )}
                    {flair && (
                      <span
                        className="text-xl"
                        role="img"
                        aria-label="Player Flair"
                      >
                        {flair}
                      </span>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={handleEditClick}
                  >
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Pencil className="h-4 w-4" />
                        </TooltipTrigger>
                        <TooltipContent>Edit Name</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Button>
                </>
              )}
            </div>
            <EloBadge elo={session?.user?.elo} className="mt-1" />
            <div className="text-sm text-muted-foreground mt-1">
              Customize your avatar and name.
            </div>
          </div>
        </div>

        {(typeof totalGames === "number" ||
          typeof winRate === "number" ||
          typeof wins === "number" ||
          typeof losses === "number" ||
          typeof draws === "number" ||
          typeof resigns === "number") &&
          session &&
          status === "authenticated" && (
            <div className="mt-6 pt-4 border-t border-border/20">
              <div className="flex items-center gap-2 mb-3 text-muted-foreground">
                <BarChart3 className="h-4 w-4" />
                <h4 className="text-sm font-semibold tracking-wide">
                  Quick Stats
                </h4>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {[
                  {
                    icon: Gamepad2,
                    label: "Games",
                    value: totalGames,
                    color: "text-primary",
                  },
                  {
                    icon: TrendingUp,
                    label: "Win Rate",
                    value:
                      winRate !== undefined
                        ? `${winRate.toFixed(0)}%`
                        : undefined,
                    color:
                      winRate !== undefined
                        ? winRate >= 60
                          ? "text-green-500"
                          : winRate >= 40
                            ? "text-yellow-500"
                            : "text-red-500"
                        : "text-muted-foreground",
                  },
                  {
                    icon: Trophy,
                    label: "Wins",
                    value: wins,
                    color: "text-yellow-500",
                  },
                  {
                    icon: ShieldX,
                    label: "Losses",
                    value: losses,
                    color: "text-red-500",
                  },
                  {
                    icon: MinusSquare,
                    label: "Draws",
                    value: draws,
                    color: "text-blue-500",
                  },
                  {
                    icon: Flag,
                    label: "Resigns",
                    value: resigns,
                    color: "text-orange-500",
                  },
                ]
                  .filter((stat) => typeof stat.value !== "undefined")
                  .map((stat) => (
                    <div
                      key={stat.label}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <stat.icon className={`h-3.5 w-3.5 ${stat.color}`} />
                        <span>{stat.label}:</span>
                      </div>
                      <span className={`font-semibold ${stat.color}`}>
                        {stat.value}
                      </span>
                    </div>
                  ))}
                {typeof totalGames === "undefined" && // Show a message if stats are not loaded yet but user is logged in
                  status === "authenticated" &&
                  !isLoading && (
                    <p className="col-span-2 text-xs text-muted-foreground text-center py-2">
                      Play some games to see your stats.
                    </p>
                  )}
              </div>
            </div>
          )}

        <div className="text-sm text-muted-foreground">
          <Link
            href="/history?tab=history"
            onClick={() => setIsNavigatingToHistory(true)}
            className="group mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary/10 px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/20 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {isNavigatingToHistory ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                View Game History
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
