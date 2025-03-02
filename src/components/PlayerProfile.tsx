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
import { supabase } from "@/lib/supabase";

interface PlayerProfileProps {
  className?: string;
}

export default function PlayerProfile({ className }: PlayerProfileProps) {
  const { session, status, refreshSession } = useAuth();
  const [playerName, setPlayerName] = useState("Player");
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("/avatars/jake.png");
  const [availableAvatars, setAvailableAvatars] = useState<string[]>([]);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  // Force refresh when session changes
  useEffect(() => {
    if (session) {
      setLastRefresh(Date.now());
    }
  }, [session]);

  // Load player data from backend
  useEffect(() => {
    async function loadUserSettings() {
      if (status === "authenticated" && session?.user?.id) {
        setIsLoading(true);
        try {
          const { data, error } = await supabase
            .from("user_settings")
            .select("*")
            .filter("user_id", "eq", session.user.id)
            .maybeSingle();

          if (error && error.code !== "PGRST116") {
            console.error("Error fetching settings:", error);
          } else if (data) {
            setPlayerName(data.display_name);
            setInputValue(data.display_name);
            setAvatarUrl(data.avatar_url);
          } else {
            // Use defaults or user info from session
            const defaultName = session.user.name || "Player";
            const defaultAvatar = session.user.image || "/avatars/jake.png";
            setPlayerName(defaultName);
            setInputValue(defaultName);
            setAvatarUrl(defaultAvatar);
          }
        } catch (error) {
          console.error("Unexpected error:", error);
        } finally {
          setIsLoading(false);
        }
      } else if (status === "unauthenticated") {
        setIsLoading(false);
      }
    }

    loadUserSettings();
  }, [session, status, lastRefresh]);

  // Load available avatars
  useEffect(() => {
    const avatars = [
      "/avatars/aang.png",
      "/avatars/bojack.png",
      "/avatars/bubblegum.png",
      "/avatars/finn.png",
      "/avatars/homer.png",
      "/avatars/jake.png",
      "/avatars/marceline.png",
      "/avatars/mordecai.png",
      "/avatars/patrick.png",
      "/avatars/peter.png",
      "/avatars/rigby.png",
      "/avatars/sandy.png",
      "/avatars/spongebob.png",
      "/avatars/squidward.png",
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
      // First check if the user has permission to access the table
      const { error: permissionError } = await supabase
        .from("user_settings")
        .select("count")
        .limit(1);

      if (permissionError) {
        console.error("Permission error:", permissionError);
        setIsLoading(false);
        setIsEditing(false);
        return;
      }

      const { data: existingSettings, error: checkError } = await supabase
        .from("user_settings")
        .select("id")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (checkError) {
        console.error("Error checking settings:", checkError);
        setIsLoading(false);
        setIsEditing(false);
        return;
      }

      if (existingSettings) {
        // Update existing settings
        const { error } = await supabase
          .from("user_settings")
          .update({
            display_name: newName,
          })
          .eq("user_id", session.user.id);

        if (error) {
          console.error("Error updating name:", error);
        } else {
          // Refresh session to update profile everywhere
          await refreshSession();
        }
      } else {
        // Create new settings
        const { error: insertError } = await supabase
          .from("user_settings")
          .insert({
            user_id: session.user.id,
            display_name: newName,
            avatar_url: avatarUrl,
            preferred_difficulty: "intermediate",
            theme_preference: "dark",
            sound_enabled: true,
            notifications_enabled: true,
          });

        if (insertError) {
          console.error("Error creating settings:", insertError);
        } else {
          // Refresh session to update profile everywhere
          await refreshSession();
        }
      }
    } catch (error) {
      console.error("Unexpected error:", error);
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

    setAvatarUrl(avatarPath);
    setIsAvatarDialogOpen(false);
    setIsLoading(true);

    try {
      // First check if the user has permission to access the table
      const { error: permissionError } = await supabase
        .from("user_settings")
        .select("count")
        .limit(1);

      if (permissionError) {
        console.error("Permission error:", permissionError);
        setIsLoading(false);
        return;
      }

      const { data: existingSettings, error: checkError } = await supabase
        .from("user_settings")
        .select("id")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (checkError) {
        console.error("Error checking settings:", checkError);
        setIsLoading(false);
        return;
      }

      if (existingSettings) {
        // Update existing settings
        const { error } = await supabase
          .from("user_settings")
          .update({
            avatar_url: avatarPath,
          })
          .eq("user_id", session.user.id);

        if (error) {
          console.error("Error updating avatar:", error);
        } else {
          // Refresh session to update profile everywhere
          await refreshSession();
        }
      } else {
        // Create new settings
        const { error: insertError } = await supabase
          .from("user_settings")
          .insert({
            user_id: session.user.id,
            display_name: playerName,
            avatar_url: avatarPath,
            preferred_difficulty: "intermediate",
            theme_preference: "dark",
            sound_enabled: true,
            notifications_enabled: true,
          });

        if (insertError) {
          console.error("Error creating settings:", insertError);
        } else {
          // Refresh session to update profile everywhere
          await refreshSession();
        }
      }
    } catch (error) {
      console.error("Unexpected error:", error);
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
              <Button
                variant="ghost"
                className="p-0 h-auto rounded-full relative group"
              >
                <Avatar className="h-16 w-16 cursor-pointer border-2 border-primary/50 group-hover:border-primary transition-all">
                  <AvatarImage src={avatarUrl} alt={playerName} />
                  <AvatarFallback>{playerName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Pencil className="h-5 w-5 text-white" />
                </div>
              </Button>
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
                    <Button
                      key={index}
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
                  <span className="text-xl font-bold">{playerName}</span>
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
