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

interface PlayerProfileProps {
  className?: string;
}

export default function PlayerProfile({ className }: PlayerProfileProps) {
  const [playerName, setPlayerName] = useState("Player");
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("/default-pfp.png");
  const [availableAvatars, setAvailableAvatars] = useState<string[]>([]);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);

  // Load player data from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPlayerName = localStorage.getItem("chess-player-name");
      const savedAvatarUrl = localStorage.getItem("chess-player-avatar");

      if (savedPlayerName) {
        setPlayerName(savedPlayerName);
        setInputValue(savedPlayerName);
      }

      if (savedAvatarUrl) {
        setAvatarUrl(savedAvatarUrl);
      }
    }
  }, []);

  // Load available avatars
  useEffect(() => {
    const avatars = [
      "/avatar/aang.png",
      "/avatar/bojack.png",
      "/avatar/bubblegum.png",
      "/avatar/finn.png",
      "/avatar/homer.png",
      "/avatar/jake.png",
      "/avatar/marceline.png",
      "/avatar/mordecai.png",
      "/avatar/patrick.png",
      "/avatar/peter.png",
      "/avatar/rigby.png",
      "/avatar/sandy.png",
      "/avatar/spongebob.png",
      "/avatar/squidward.png",
      "/default-pfp.png",
    ];

    setAvailableAvatars(avatars);
  }, []);

  const handleEditClick = () => {
    setIsEditing(true);
    setInputValue(playerName);
  };

  const handleSaveName = () => {
    if (inputValue.trim()) {
      setPlayerName(inputValue.trim());
      localStorage.setItem("chess-player-name", inputValue.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveName();
    } else if (e.key === "Escape") {
      setIsEditing(false);
    }
  };

  const handleAvatarSelect = (avatarPath: string) => {
    setAvatarUrl(avatarPath);
    localStorage.setItem("chess-player-avatar", avatarPath);
    setIsAvatarDialogOpen(false);
  };

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
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Choose Avatar</DialogTitle>
              </DialogHeader>
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
