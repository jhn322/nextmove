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
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Pencil } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import Image from "next/image";
import HoverText from "@/components/ui/hover-text";
import { getCharacterNameFromPath } from "@/lib/utils";

interface PlayerProfileProps {
  className?: string;
}

export default function PlayerProfile({ className }: PlayerProfileProps) {
  const { session, status, refreshSession } = useAuth();
  const [playerName, setPlayerName] = useState<string>("Player");
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("/avatars/jake.png");
  const [countryFlag, setCountryFlag] = useState<string>("");
  const [flair, setFlair] = useState<string>("");
  const [availableAvatars, setAvailableAvatars] = useState<string[]>([]);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load player data from session
  useEffect(() => {
    setIsLoading(true);
    if (status === "authenticated" && session?.user) {
      const user = session.user;
      setPlayerName(user.name || "Player");
      setInputValue(user.name || "Player");
      setAvatarUrl(user.image || "/avatars/jake.png");
      setCountryFlag(user.countryFlag || "");
      setFlair(user.flair || "");
      setIsLoading(false);
    } else if (status === "unauthenticated") {
      // Reset to defaults if logged out
      setPlayerName("Player");
      setInputValue("Player");
      setAvatarUrl("/avatars/jake.png");
      setCountryFlag("");
      setFlair("");
      setIsLoading(false);
    }
    // Add session.user as dependency
  }, [session?.user, status]);

  // Load available avatars
  useEffect(() => {
    const avatars = [
      "/avatars/aang.png",
      "/avatars/bart.png",
      "/avatars/bender.png",
      "/avatars/benson.png",
      "/avatars/blossom.png",
      "/avatars/bojack.png",
      "/avatars/bubbles.png",
      "/avatars/bubblegum.png",
      "/avatars/buttercup.png",
      "/avatars/catdog.png",
      "/avatars/courage.png",
      "/avatars/darwin.png",
      "/avatars/deedee.png",
      "/avatars/dexter.png",
      "/avatars/dipper.png",
      "/avatars/ed.png",
      "/avatars/edd.png",
      "/avatars/eddy.png",
      "/avatars/finn.png",
      "/avatars/flame.png",
      "/avatars/gir.png",
      "/avatars/grim.png",
      "/avatars/gumball.png",
      "/avatars/homer.png",
      "/avatars/jake.png",
      "/avatars/jerry.png",
      "/avatars/jimmy.png",
      "/avatars/johnny.png",
      "/avatars/marceline.png",
      "/avatars/mordecai.png",
      "/avatars/morty.png",
      "/avatars/patrick.png",
      "/avatars/perry.png",
      "/avatars/peter.png",
      "/avatars/rick.png",
      "/avatars/rigby.png",
      "/avatars/samurai.png",
      "/avatars/sandy.png",
      "/avatars/scooby.png",
      "/avatars/shaggy.png",
      "/avatars/skips.png",
      "/avatars/spongebob.png",
      "/avatars/squidward.png",
      "/avatars/stewie.png",
      "/avatars/timmy.png",
      "/avatars/tom.png",
      "/avatars/wendy.png",
      "/avatars/zim.png",
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
    setPlayerName(newName); // Optimistically update UI

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
    setAvatarUrl(avatarPath); // Optimistically update UI
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

  // If not authenticated, don't render the component
  if (status === "unauthenticated") {
    return null;
  }

  // Show loading state
  if (status === "loading" || isLoading) {
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
                    <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Pencil className="h-5 w-5 text-white" />
                    </div>
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
                  <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Pencil className="h-5 w-5 text-white" />
                  </div>
                </Button>
              )}
            </DialogTrigger>
            <DialogContent
              className="sm:max-w-md"
              aria-describedby="profile-avatar-dialog-description"
            >
              <DialogHeader>
                <DialogTitle>Choose Avatar</DialogTitle>
              </DialogHeader>
              <div
                id="profile-avatar-dialog-description"
                className="text-sm text-muted-foreground mb-4"
              >
                Select an avatar to represent you in games
              </div>
              <ScrollArea className="h-[300px] mt-2">
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 p-2">
                  {availableAvatars.map((avatar, index) => (
                    <HoverText
                      key={index}
                      text={getCharacterNameFromPath(avatar)}
                      side="bottom"
                    >
                      <Button
                        variant="ghost"
                        className="p-1 h-auto relative"
                        onClick={() => handleAvatarSelect(avatar)}
                      >
                        <div className="relative">
                          <Avatar className="h-16 w-16 border-2 border-transparent hover:border-primary transition-all">
                            <AvatarImage
                              src={avatar}
                              alt={`Avatar ${index + 1}`}
                            />
                            <AvatarFallback>?</AvatarFallback>
                          </Avatar>
                          {avatar === avatarUrl && (
                            <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-0.5">
                              <Check className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                      </Button>
                    </HoverText>
                  ))}
                </div>
              </ScrollArea>
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
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold">
                      {playerName || "Player"}
                    </span>
                    {countryFlag && (
                      <Image
                        src={`/flags/${countryFlag}.png`}
                        alt={`${countryFlag} flag`}
                        width={20}
                        height={12}
                        className="h-3 w-5"
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
                    <Pencil className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Choose your player name to appear during games
            </div>
          </div>
        </div>

        <div className="bg-primary/10 rounded-lg p-3 text-sm">
          <p className="font-medium text-primary">Game Progress</p>
          <p className="text-muted-foreground mt-1">
            Your game progress and settings are saved automatically
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
