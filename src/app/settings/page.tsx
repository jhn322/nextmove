"use client";

import { useAuth } from "@/context/auth-context";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertCircle,
  Check,
  Crown,
  Grid3X3,
  Palette,
  Volume2,
  VolumeX,
  Zap,
} from "lucide-react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  saveAllSettings,
  getPieceSet,
  getDefaultColor,
  getShowCoordinates,
  getEnableAnimations,
  getSoundEnabled,
} from "@/lib/settings";

interface UserSettings {
  display_name: string;
  avatar_url: string;
  preferred_difficulty: string;
  sound_enabled: boolean;
  piece_set: string;
  default_color: string;
  show_coordinates: boolean;
  enable_animations: boolean;
}

export default function SettingsPage() {
  const { session, status, refreshSession } = useAuth();
  const [settings, setSettings] = useState<UserSettings>({
    display_name: "",
    avatar_url: "",
    preferred_difficulty: "intermediate",
    sound_enabled: true,
    piece_set: "staunty",
    default_color: "w",
    show_coordinates: true,
    enable_animations: true,
  });
  const [loading, setLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [availableAvatars, setAvailableAvatars] = useState<string[]>([]);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);

  // Define the difficulty levels
  const difficultyLevels = [
    "beginner",
    "easy",
    "intermediate",
    "advanced",
    "hard",
    "expert",
    "master",
    "grandmaster",
  ];

  // Define the piece sets
  const pieceSets = [
    "staunty",
    "california",
    "cardinal",
    "cburnett",
    "chessicons",
    "chessmonk",
    "chessnut",
    "freestaunton",
    "fresca",
    "gioco",
    "governor",
    "icpieces",
    "kosal",
    "maestro",
    "merida_new",
    "pixel",
    "riohacha",
    "tatiana",
  ];

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

  // Load user settings from database and localStorage
  useEffect(() => {
    async function loadUserSettings() {
      if (status === "authenticated" && session?.user?.id) {
        setLoading(true);
        setError(null);

        try {
          const { error: permissionCheckError } = await supabase
            .from("user_settings")
            .select("count")
            .limit(1);

          if (permissionCheckError) {
            setError(
              "You don't have permission to access settings. Please contact support."
            );
            setLoading(false);
            return;
          }

          // Check if settings exist
          const { data, error } = await supabase
            .from("user_settings")
            .select("*")
            .eq("user_id", session.user.id)
            .maybeSingle();

          if (error && error.code !== "PGRST116") {
            // PGRST116 is the error code for "no rows returned"
            console.error("Error fetching settings:", error);
            setSaveMessage("Failed to load settings");
            setError(error.message);
          } else if (data) {
            // Get additional settings from localStorage
            const pieceSet = getPieceSet();
            const defaultColor = getDefaultColor();
            const showCoordinates = getShowCoordinates();
            const enableAnimations = getEnableAnimations();

            // Settings exist, update state
            setSettings({
              display_name: data.display_name,
              avatar_url: data.avatar_url,
              preferred_difficulty: data.preferred_difficulty,
              sound_enabled: data.sound_enabled,
              piece_set: pieceSet,
              default_color: defaultColor,
              show_coordinates: showCoordinates,
              enable_animations: enableAnimations,
            });
          } else {
            // Settings don't exist, but don't try to create them automatically
            // Get additional settings from localStorage
            const pieceSet = getPieceSet();
            const defaultColor = getDefaultColor();
            const showCoordinates = getShowCoordinates();
            const enableAnimations = getEnableAnimations();

            // Set default values
            setSettings({
              display_name: session.user.name || "Chess Player",
              avatar_url: session.user.image || "/avatars/jake.png",
              preferred_difficulty: "intermediate",
              sound_enabled: getSoundEnabled(),
              piece_set: pieceSet,
              default_color: defaultColor,
              show_coordinates: showCoordinates,
              enable_animations: enableAnimations,
            });
          }
        } catch (error: unknown) {
          console.error("Unexpected error:", error);
          setError(
            error instanceof Error
              ? error.message
              : "An unexpected error occurred"
          );
        } finally {
          setLoading(false);
        }
      } else if (status === "unauthenticated") {
        setLoading(false);
      }
    }

    loadUserSettings();
  }, [session, status]);

  const handleSaveSettings = async () => {
    if (!session?.user?.id) return;

    setLoading(true);
    setError(null);

    try {
      // Save additional settings to localStorage first
      saveAllSettings({
        pieceSet: settings.piece_set,
        defaultColor: settings.default_color as "w" | "b",
        showCoordinates: settings.show_coordinates,
        enableAnimations: settings.enable_animations,
        soundEnabled: settings.sound_enabled,
      });

      // Only include fields that are guaranteed to exist in the database
      const baseSettings = {
        display_name: settings.display_name,
        avatar_url: settings.avatar_url,
        preferred_difficulty: settings.preferred_difficulty,
        sound_enabled: settings.sound_enabled,
      };

      const { data: existingSettings, error: checkError } = await supabase
        .from("user_settings")
        .select("id")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (checkError) {
        setError(checkError.message);
        setLoading(false);
        return;
      }

      if (existingSettings) {
        // Update existing settings
        const { error } = await supabase
          .from("user_settings")
          .update(baseSettings)
          .eq("user_id", session.user.id);

        if (error) {
          console.error("Error updating settings:", error);
          setSaveMessage("Failed to save settings");
          setError(error.message);
        } else {
          setSaveMessage("Settings saved successfully");
          setError(null);

          // Refresh the session to update the player profile
          await refreshSession();

          setTimeout(() => setSaveMessage(""), 3000);
        }
      } else {
        // Create new settings
        const { error: insertError } = await supabase
          .from("user_settings")
          .insert({
            user_id: session.user.id,
            display_name:
              settings.display_name || session.user.name || "Chess Player",
            avatar_url:
              settings.avatar_url || session.user.image || "/avatars/jake.png",
            preferred_difficulty: settings.preferred_difficulty,
            theme_preference: "dark",
            sound_enabled: settings.sound_enabled,
            notifications_enabled: true, // Keep this for database compatibility
          });

        if (insertError) {
          console.error("Error creating settings:", insertError);
          setSaveMessage("Failed to create settings");
          setError(insertError.message);
        } else {
          setSaveMessage("Settings saved successfully");
          setError(null);

          // Refresh the session to update the player profile
          await refreshSession();

          setTimeout(() => setSaveMessage(""), 3000);
        }
      }
    } catch (error: unknown) {
      console.error("Unexpected error:", error);
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarSelect = (avatarPath: string) => {
    setSettings({ ...settings, avatar_url: avatarPath });
    setIsAvatarDialogOpen(false);
  };

  if (status === "loading" || loading) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Not Authenticated</CardTitle>
            <CardDescription>
              Please sign in to view your settings.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>User Settings</CardTitle>
          <CardDescription>
            Manage your account settings and preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {saveMessage && !error && (
            <Alert className="mb-6 border-green-500 bg-green-50 dark:bg-green-900/20">
              <Check className="h-4 w-4 text-green-500" />
              <AlertTitle className="text-green-500">Success</AlertTitle>
              <AlertDescription className="text-green-500">
                {saveMessage}
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="game">Game Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6 mt-6">
              <div className="space-y-2">
                <Label htmlFor="display_name">Display Name</Label>
                <Input
                  id="display_name"
                  value={settings.display_name}
                  onChange={(e) =>
                    setSettings({ ...settings, display_name: e.target.value })
                  }
                  maxLength={20}
                />
              </div>

              <div className="space-y-2">
                <Label>Avatar</Label>
                <div className="flex items-center gap-4">
                  <Dialog
                    open={isAvatarDialogOpen}
                    onOpenChange={setIsAvatarDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="p-0 h-auto w-auto rounded-full relative group"
                      >
                        <Avatar className="h-16 w-16 cursor-pointer border-2 border-primary/50 group-hover:border-primary transition-all">
                          <AvatarImage src={settings.avatar_url} alt="Avatar" />
                          <AvatarFallback>
                            {settings.display_name?.charAt(0) || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <span className="text-xs text-white font-medium">
                            Change
                          </span>
                        </div>
                      </Button>
                    </DialogTrigger>
                    <DialogContent
                      className="sm:max-w-md"
                      aria-describedby="avatar-dialog-description"
                    >
                      <DialogHeader>
                        <DialogTitle>Choose Avatar</DialogTitle>
                      </DialogHeader>
                      <div
                        id="avatar-dialog-description"
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
                                {avatar === settings.avatar_url && (
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
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Select an avatar to represent you in games
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="game" className="space-y-6 mt-6">
              <div className="space-y-2">
                <Label htmlFor="preferred_difficulty">
                  Preferred Difficulty
                </Label>
                <Select
                  value={settings.preferred_difficulty}
                  onValueChange={(value) =>
                    setSettings({ ...settings, preferred_difficulty: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    {difficultyLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="piece_set">Chess Piece Set</Label>
                <Select
                  value={settings.piece_set}
                  onValueChange={(value) =>
                    setSettings({ ...settings, piece_set: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select piece set">
                      <div className="flex items-center gap-2">
                        <Palette className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                        <span className="capitalize truncate">
                          {settings.piece_set.replace("_", " ")}
                        </span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {pieceSets.map((set) => (
                      <SelectItem key={set} value={set}>
                        <div className="flex items-center gap-2">
                          <span className="capitalize">
                            {set.replace("_", " ")}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="mt-2 flex justify-center">
                  <div className="grid grid-cols-4 gap-2 p-2 bg-muted/30 rounded-md">
                    {["k", "q", "r", "b"].map((piece) => (
                      <div key={piece} className="w-8 h-8">
                        <Image
                          src={`/pieces/${settings.piece_set}/w${piece}.svg`}
                          alt={`${piece} piece`}
                          width={32}
                          height={32}
                          className="w-full h-full"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="default_color">Default Player Color</Label>
                <div className="flex gap-3 mt-2">
                  <Button
                    onClick={() =>
                      setSettings({ ...settings, default_color: "w" })
                    }
                    variant={
                      settings.default_color === "w" ? "default" : "outline"
                    }
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <Crown className="h-4 w-4 fill-current" />
                    White
                  </Button>
                  <Button
                    onClick={() =>
                      setSettings({ ...settings, default_color: "b" })
                    }
                    variant={
                      settings.default_color === "b" ? "default" : "outline"
                    }
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <Crown className="h-4 w-4" />
                    Black
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sound_enabled">Sound</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable or disable game sounds
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {settings.sound_enabled ? (
                    <Volume2 className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <VolumeX className="h-4 w-4 text-muted-foreground" />
                  )}
                  <Switch
                    id="sound_enabled"
                    checked={settings.sound_enabled}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, sound_enabled: checked })
                    }
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show_coordinates">Board Coordinates</Label>
                  <p className="text-sm text-muted-foreground">
                    Show coordinates on the chess board
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Grid3X3 className="h-4 w-4 text-muted-foreground" />
                  <Switch
                    id="show_coordinates"
                    checked={settings.show_coordinates}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, show_coordinates: checked })
                    }
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enable_animations">Animations</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable or disable game animations
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  <Switch
                    id="enable_animations"
                    checked={settings.enable_animations}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, enable_animations: checked })
                    }
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-2">
          <Button onClick={handleSaveSettings} disabled={loading}>
            Save Settings
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
