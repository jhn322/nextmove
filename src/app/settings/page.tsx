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
  PartyPopper,
  Clock,
  Flag,
  Sparkles,
  Pencil,
  Trash2,
  Contrast,
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
  getShowCoordinates,
  getEnableAnimations,
  getHighContrast,
  getAutoQueen,
  getMoveInputMethod,
  getBoardTheme,
} from "@/lib/settings";
import { useRouter } from "next/navigation";
import SettingsLoading from "./loading";
import HoverText from "@/components/ui/hover-text";
import { getCharacterNameFromPath } from "@/lib/utils";
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
import { useTheme } from "next-themes";
import { boardThemes } from "@/components/game/board/Square";
import {
  BOARD_PIECE_PRESETS,
  BoardPiecePreset,
} from "@/lib/settings/boardPiecePresets";
import PresetPreview from "@/components/settings/PresetPreview";

interface SettingsState {
  display_name: string;
  first_name: string;
  last_name: string;
  location: string;
  avatar_url: string;
  preferred_difficulty: string;
  sound_enabled: boolean;
  piece_set: string;
  white_pieces_bottom: boolean;
  show_coordinates: boolean;
  enable_animations: boolean;
  enable_confetti: boolean;
  timezone: string;
  clock_format: "12" | "24";
  country_flag: string;
  flair: string;
  highContrast: boolean;
  autoQueen: boolean;
  moveInputMethod: "click" | "drag" | "both";
  boardTheme: string;
  presetId?: string | null;
}

const DIFFICULTY_THEMES = [
  "beginner",
  "easy",
  "intermediate",
  "advanced",
  "hard",
  "expert",
  "master",
  "grandmaster",
];

const NON_DIFFICULTY_THEMES = Object.keys(boardThemes)
  .filter((theme) => !DIFFICULTY_THEMES.includes(theme))
  .sort((a, b) => a.localeCompare(b));

const BoardThemePreview = ({ theme }: { theme: string }) => {
  const colors = boardThemes[theme] || boardThemes["emerald"];
  return (
    <div className="flex gap-4 items-center mt-2">
      <div
        className={`w-10 h-10 rounded border ${colors.light}`}
        title="Light square"
      />
      <div
        className={`w-10 h-10 rounded border ${colors.dark}`}
        title="Dark square"
      />
    </div>
  );
};

const findMatchingPreset = (
  boardTheme: string,
  pieceSet: string
): BoardPiecePreset | undefined =>
  BOARD_PIECE_PRESETS.find(
    (preset) => preset.boardTheme === boardTheme && preset.pieceSet === pieceSet
  );

const AppearancePresetGrid = ({
  BOARD_PIECE_PRESETS,
  presetId,
  setSettings,
  setPresetId,
}: {
  BOARD_PIECE_PRESETS: BoardPiecePreset[];
  presetId: string | null;
  setSettings: React.Dispatch<React.SetStateAction<SettingsState>>;
  setPresetId: React.Dispatch<React.SetStateAction<string | null>>;
}) => {
  const [showAll, setShowAll] = useState(false);
  const presetsPerRow = 4;
  const defaultRows = 3;
  const defaultCount = presetsPerRow * defaultRows;
  const visiblePresets = showAll
    ? BOARD_PIECE_PRESETS
    : BOARD_PIECE_PRESETS.slice(0, defaultCount);
  return (
    <>
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4`}
      >
        {visiblePresets.map((preset) => {
          const isSelected = presetId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              className={`flex flex-col items-center p-3 rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-primary/60
                ${isSelected ? "border-primary ring-2 ring-primary/60 bg-primary/5" : "border-border bg-card hover:bg-accent/30"}`}
              onClick={() => {
                setSettings((prev) => ({
                  ...prev,
                  boardTheme: preset.boardTheme,
                  piece_set: preset.pieceSet,
                }));
                setPresetId(preset.id);
              }}
              tabIndex={0}
              aria-label={`Select preset: ${preset.name}`}
            >
              <PresetPreview
                boardTheme={preset.boardTheme}
                pieceSet={preset.pieceSet}
              />
              <span className="mt-2 font-medium text-sm text-foreground text-center">
                {preset.name}
              </span>
              <span className="text-xs text-muted-foreground text-center">
                {preset.description}
              </span>
              {isSelected && (
                <span className="mt-1 text-xs text-primary font-semibold">
                  Selected
                </span>
              )}
            </button>
          );
        })}
      </div>
      {BOARD_PIECE_PRESETS.length > defaultCount && (
        <div className="flex justify-center mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAll((prev) => !prev)}
            className="text-xs"
          >
            {showAll ? "Show less" : "Show all"}
          </Button>
        </div>
      )}
    </>
  );
};

export default function SettingsPage() {
  const { status, session, signOut, refreshSession } = useAuth();
  const [settings, setSettings] = useState<SettingsState>(() => {
    return {
      display_name: "",
      first_name: "",
      last_name: "",
      location: "",
      avatar_url: "",
      preferred_difficulty: "intermediate",
      sound_enabled: true,
      piece_set: getPieceSet(),
      white_pieces_bottom: true,
      show_coordinates: getShowCoordinates(),
      enable_animations: getEnableAnimations(),
      enable_confetti: true,
      timezone: "UTC",
      clock_format: "24",
      country_flag: "",
      flair: "",
      highContrast: getHighContrast(),
      autoQueen: getAutoQueen(),
      moveInputMethod: getMoveInputMethod(),
      boardTheme: getBoardTheme(),
    };
  });
  const [initialSettings, setInitialSettings] = useState<SettingsState | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [availableAvatars, setAvailableAvatars] = useState<string[]>([]);
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [flairDialogOpen, setFlairDialogOpen] = useState(false);
  const router = useRouter();
  const { setTheme, theme } = useTheme();
  const [presetId, setPresetId] = useState<string | null>(null);

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

  useEffect(() => {
    if (status === "loading") {
      setLoading(true);
      return;
    }

    if (status === "unauthenticated" || !session?.user) {
      router.push("/auth/login?callbackUrl=/settings");
      return;
    }

    setLoading(true);
    setError(null);
    const user = session.user;

    setSettings({
      display_name: user.name || "",
      first_name: user.firstName || "",
      last_name: user.lastName || "",
      location: user.location || "",
      avatar_url: user.image || "/avatars/jake.png",
      preferred_difficulty: user.preferredDifficulty || "intermediate",
      sound_enabled: user.soundEnabled !== false,
      piece_set: user.pieceSet || getPieceSet(),
      white_pieces_bottom: user.whitePiecesBottom !== false,
      show_coordinates: user.showCoordinates !== false,
      enable_animations: user.enableAnimations !== false,
      enable_confetti: user.enableConfetti !== false,
      timezone: user.timezone || "UTC",
      clock_format: user.clockFormat === "12" ? "12" : "24",
      country_flag: user.countryFlag || "",
      flair: user.flair || "",
      highContrast:
        "highContrast" in user && typeof user.highContrast === "boolean"
          ? user.highContrast
          : getHighContrast(),
      autoQueen:
        "autoQueen" in user && typeof user.autoQueen === "boolean"
          ? user.autoQueen
          : getAutoQueen(),
      moveInputMethod:
        "moveInputMethod" in user &&
        (user.moveInputMethod === "click" ||
          user.moveInputMethod === "drag" ||
          user.moveInputMethod === "both")
          ? user.moveInputMethod
          : getMoveInputMethod(),
      boardTheme:
        "boardTheme" in user && typeof user.boardTheme === "string"
          ? user.boardTheme
          : getBoardTheme(),
    });

    setInitialSettings({
      display_name: user.name || "",
      first_name: user.firstName || "",
      last_name: user.lastName || "",
      location: user.location || "",
      avatar_url: user.image || "/avatars/jake.png",
      preferred_difficulty: user.preferredDifficulty || "intermediate",
      sound_enabled: user.soundEnabled !== false,
      piece_set: user.pieceSet || getPieceSet(),
      white_pieces_bottom: user.whitePiecesBottom !== false,
      show_coordinates: user.showCoordinates !== false,
      enable_animations: user.enableAnimations !== false,
      enable_confetti: user.enableConfetti !== false,
      timezone: user.timezone || "UTC",
      clock_format: user.clockFormat === "12" ? "12" : "24",
      country_flag: user.countryFlag || "",
      flair: user.flair || "",
      highContrast:
        "highContrast" in user && typeof user.highContrast === "boolean"
          ? user.highContrast
          : getHighContrast(),
      autoQueen:
        "autoQueen" in user && typeof user.autoQueen === "boolean"
          ? user.autoQueen
          : getAutoQueen(),
      moveInputMethod:
        "moveInputMethod" in user &&
        (user.moveInputMethod === "click" ||
          user.moveInputMethod === "drag" ||
          user.moveInputMethod === "both")
          ? user.moveInputMethod
          : getMoveInputMethod(),
      boardTheme:
        "boardTheme" in user && typeof user.boardTheme === "string"
          ? user.boardTheme
          : getBoardTheme(),
    });

    setLoading(false);
  }, [status, session, router]);

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

  useEffect(() => {
    const match = findMatchingPreset(settings.boardTheme, settings.piece_set);
    setPresetId(match ? match.id : null);
  }, [settings.boardTheme, settings.piece_set]);

  const handleSaveSettings = async () => {
    if (!session?.user?.id) {
      setError("You need to be signed in to save settings");
      return;
    }

    setSaveMessage("");
    setLoading(true);
    setError(null);

    const dataToSend = {
      name: settings.display_name,
      firstName: settings.first_name,
      lastName: settings.last_name,
      location: settings.location,
      image: settings.avatar_url,
      countryFlag: settings.country_flag,
      flair: settings.flair,
      timezone: settings.timezone,
      clockFormat: settings.clock_format,
      preferredDifficulty: settings.preferred_difficulty,
      soundEnabled: settings.sound_enabled,
      pieceSet: settings.piece_set,
      whitePiecesBottom: settings.white_pieces_bottom,
      showCoordinates: settings.show_coordinates,
      enableAnimations: settings.enable_animations,
      enableConfetti: settings.enable_confetti,
      highContrast: settings.highContrast,
      autoQueen: settings.autoQueen,
      moveInputMethod: settings.moveInputMethod,
      boardTheme: settings.boardTheme,
    };

    try {
      const response = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to save settings:", errorData);
        setError(
          errorData.message || "Failed to save settings. Please try again."
        );
      } else {
        saveAllSettings({
          pieceSet: settings.piece_set,
          whitePiecesBottom: settings.white_pieces_bottom,
          showCoordinates: settings.show_coordinates,
          enableAnimations: settings.enable_animations,
          soundEnabled: settings.sound_enabled,
          enableConfetti: settings.enable_confetti,
          timezone: settings.timezone,
          clockFormat: settings.clock_format,
          countryFlag: settings.country_flag,
          flair: settings.flair,
          highContrast: settings.highContrast,
          autoQueen: settings.autoQueen,
          moveInputMethod: settings.moveInputMethod,
          boardTheme: settings.boardTheme,
        });

        setSaveMessage("Settings saved successfully");
        await refreshSession();
        setTimeout(() => setSaveMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      setError("An unexpected network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarSelect = (avatarPath: string) => {
    setSettings({ ...settings, avatar_url: avatarPath });
    setAvatarDialogOpen(false);
  };

  const handleDeleteAccount = async () => {
    if (!session?.user?.id) {
      setError("You need to be signed in to delete your account");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/user/account", {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(
          errorData.message || "Failed to delete account. Please try again."
        );
      } else {
        localStorage.clear();
        await signOut({ redirect: false });
        router.push("/");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      setError(
        "An unexpected network error occurred while deleting your account."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleHighContrastToggle = (checked: boolean) => {
    setSettings((prev) => ({ ...prev, highContrast: checked }));
    if (checked) {
      // Store previous theme
      if (theme !== "high-contrast") {
        localStorage.setItem("previous-theme", theme || "system");
      }
      setTheme("high-contrast");
    } else {
      // Restore previous theme
      const prevTheme = localStorage.getItem("previous-theme") || "system";
      setTheme(prevTheme);
    }
  };

  // Keep highContrast toggle in sync with theme changes
  useEffect(() => {
    if (theme !== "high-contrast" && settings.highContrast) {
      setSettings((prev) => ({ ...prev, highContrast: false }));
    } else if (theme === "high-contrast" && !settings.highContrast) {
      setSettings((prev) => ({ ...prev, highContrast: true }));
    }
  }, [theme, settings.highContrast]);

  const isChanged =
    initialSettings &&
    JSON.stringify(settings) !== JSON.stringify(initialSettings);

  if (status === "loading" || loading) {
    return <SettingsLoading />;
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (status !== "authenticated" || !session?.user) {
    return <SettingsLoading />;
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
            <Alert className="mb-6 border-green-500 bg-card text-green-600 dark:text-green-400">
              <Check className="h-4 w-4 text-green-500 dark:text-green-400" />
              <AlertTitle className="text-green-600 dark:text-green-400">
                Success
              </AlertTitle>
              <AlertDescription className="text-green-600 dark:text-green-400">
                {saveMessage}
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="profile">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="game">Gameplay</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
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
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={settings.first_name}
                  onChange={(e) =>
                    setSettings({ ...settings, first_name: e.target.value })
                  }
                  maxLength={50}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={settings.last_name}
                  onChange={(e) =>
                    setSettings({ ...settings, last_name: e.target.value })
                  }
                  maxLength={50}
                />
              </div>

              <div className="space-y-1">
                <Label className="text-sm font-medium">Email</Label>
                <p className="text-sm text-muted-foreground mt-1.5">
                  {session.user.email || "No email available"}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={settings.location}
                  onChange={(e) =>
                    setSettings({ ...settings, location: e.target.value })
                  }
                  maxLength={100}
                  placeholder="City, Country"
                />
              </div>

              <div className="space-y-2">
                <Label>Avatar</Label>
                <div className="flex items-center gap-4">
                  <Dialog
                    open={avatarDialogOpen}
                    onOpenChange={setAvatarDialogOpen}
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
                            <HoverText
                              key={index}
                              text={getCharacterNameFromPath(avatar)}
                              side="bottom"
                            >
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
                            </HoverText>
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

              <div className="space-y-2">
                <Label>Country Flag</Label>
                <Select
                  value={settings.country_flag || "none"}
                  onValueChange={(value) =>
                    setSettings({
                      ...settings,
                      country_flag: value === "none" ? "" : value,
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select country flag">
                      <div className="flex items-center gap-2">
                        <Flag className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                        {settings.country_flag ? (
                          <div className="flex items-center gap-2">
                            <Image
                              src={`/flags/${settings.country_flag}.png`}
                              alt={settings.country_flag}
                              width={20}
                              height={12}
                              className="h-3 w-5"
                            />
                            <span className="capitalize">
                              {settings.country_flag.toUpperCase()}
                            </span>
                          </div>
                        ) : (
                          <span>Select country flag</span>
                        )}
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "none",
                      "ad",
                      "am",
                      "ar",
                      "au",
                      "ba",
                      "bg",
                      "ca",
                      "cn",
                      "cu",
                      "cy",
                      "cz",
                      "de",
                      "dk",
                      "ec",
                      "eng",
                      "fi",
                      "fr",
                      "ge",
                      "gr",
                      "ie",
                      "il",
                      "in",
                      "is",
                      "it",
                      "jp",
                      "kr",
                      "lt",
                      "lu",
                      "lv",
                      "my",
                      "no",
                      "nz",
                      "ph",
                      "pk",
                      "ps",
                      "pt",
                      "ro",
                      "rs",
                      "ru",
                      "sct",
                      "se",
                      "sy",
                      "tr",
                      "ua",
                      "ug",
                      "us",
                      "uy",
                      "wls",
                    ].map((flag) => (
                      <SelectItem key={flag} value={flag}>
                        <div className="flex items-center gap-2">
                          {flag !== "none" ? (
                            <>
                              <Image
                                src={`/flags/${flag}.png`}
                                alt={flag}
                                width={20}
                                height={12}
                                className="h-3 w-5"
                              />
                              <span className="capitalize">
                                {flag.toUpperCase()}
                              </span>
                            </>
                          ) : (
                            <span>None</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Flair</Label>
                <div className="flex items-center gap-4">
                  <Dialog
                    open={flairDialogOpen}
                    onOpenChange={setFlairDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-muted-foreground" />
                          <span>{settings.flair || "Choose a flair"}</span>
                        </div>
                        <span className="text-2xl">{settings.flair}</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Choose Flair</DialogTitle>
                      </DialogHeader>
                      <ScrollArea className="h-[300px]">
                        <div className="grid grid-cols-5 gap-2 p-2">
                          {[
                            "⚔️",
                            "🎮",
                            "🎯",
                            "🎲",
                            "🏆",
                            "👑",
                            "⭐",
                            "💫",
                            "✨",
                            "🌟",
                            "🌈",
                            "💥",
                            "🔥",
                            "⚡",
                            "🌀",
                            "🌪️",
                            "🌊",
                            "☄️",
                            "🌌",
                            "🌠",
                            "🪐",
                            "🌙",
                            "☀️",
                            "🌤️",
                            "🌍",
                            "🌎",
                            "🌏",
                            "🧭",
                            "🕹️",
                            "🎼",
                            "🎵",
                            "🎶",
                            "🎤",
                            "🎧",
                            "🎷",
                            "🎸",
                            "🎻",
                            "🥁",
                            "📯",
                            "🎺",
                            "🎹",
                            "📀",
                            "💿",
                            "📸",
                            "🎥",
                            "🎬",
                            "📽️",
                            "📡",
                            "🔮",
                            "🕶️",
                            "🕵️‍♂️",
                            "🕵️‍♀️",
                            "🤖",
                            "👾",
                            "🎃",
                            "💀",
                            "👻",
                            "👽",
                            "🛸",
                            "🚀",
                            "🛰️",
                            "🛠️",
                            "🗡️",
                            "🔫",
                            "🏹",
                            "🛡️",
                            "💣",
                            "📜",
                            "🏰",
                            "🕌",
                            "🛕",
                            "⛩️",
                            "🌋",
                            "🏔️",
                            "⛰️",
                            "🗻",
                            "🏕️",
                            "🌄",
                            "🌅",
                            "🎑",
                            "🏜️",
                            "🏝️",
                            "🏞️",
                            "🌇",
                            "🌆",
                            "🏙️",
                            "🌃",
                            "🌉",
                            "🌁",
                            "🛤️",
                            "🚆",
                            "🚄",
                            "🛳️",
                            "🚢",
                            "⛵",
                            "🛶",
                            "🛺",
                            "🚘",
                            "🚖",
                            "🚍",
                            "🚌",
                            "🚋",
                            "🚊",
                            "🚉",
                            "🚁",
                            "🛩️",
                            "🦄",
                            "🐉",
                            "🐲",
                            "🐍",
                            "🦅",
                            "🦇",
                            "🐺",
                            "🦊",
                            "🐗",
                            "🦬",
                            "🦓",
                            "🦒",
                            "🐪",
                            "🐫",
                            "🦘",
                            "🐃",
                            "🐂",
                            "🐄",
                            "🦝",
                            "🦡",
                            "🦢",
                            "🦜",
                            "🐧",
                            "🦆",
                            "🐦",
                            "🕊️",
                            "🐕",
                            "🐩",
                            "🐈",
                            "🦁",
                            "🐅",
                            "🐆",
                            "🐎",
                            "🦏",
                            "🐘",
                            "🦛",
                            "🐁",
                            "🐀",
                            "🐿️",
                            "🦔",
                            "🐾",
                            "🦖",
                            "🦕",
                            "🦦",
                            "🦨",
                            "🦥",
                            "🦫",
                            "🐓",
                            "🦃",
                            "🦩",
                            "🦉",
                            "🎭",
                            "🎨",
                            "🖌️",
                            "🖍️",
                            "📝",
                            "✏️",
                            "🖊️",
                            "🖋️",
                            "📖",
                            "📚",
                            "🔖",
                            "🏹",
                            "🛠️",
                            "⚒️",
                            "🔨",
                            "⛏️",
                            "🧨",
                            "🚀",
                          ].map((emoji, index) => (
                            <Button
                              key={index}
                              variant="ghost"
                              className="h-12 text-2xl hover:bg-accent"
                              onClick={() => {
                                setSettings({ ...settings, flair: emoji });
                                setFlairDialogOpen(false);
                              }}
                            >
                              {emoji}
                            </Button>
                          ))}
                        </div>
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={settings.timezone}
                  onValueChange={(value) =>
                    setSettings({ ...settings, timezone: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select timezone">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                        <span className="truncate">{settings.timezone}</span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Intl.supportedValuesOf("timeZone").map((tz) => (
                      <SelectItem key={tz} value={tz}>
                        {tz}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="clock_format">Clock Format</Label>
                <div className="flex gap-3 mt-2">
                  <Button
                    onClick={() =>
                      setSettings({ ...settings, clock_format: "12" })
                    }
                    variant={
                      settings.clock_format === "12" ? "default" : "outline"
                    }
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <Clock className="h-4 w-4" />
                    12-hour
                  </Button>
                  <Button
                    onClick={() =>
                      setSettings({ ...settings, clock_format: "24" })
                    }
                    variant={
                      settings.clock_format === "24" ? "default" : "outline"
                    }
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <Clock className="h-4 w-4" />
                    24-hour
                  </Button>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t">
                <h3 className="text-lg font-medium text-destructive mb-4">
                  Danger Zone
                </h3>
                <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">Delete Account</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Permanently delete your account and all associated data.
                        This action cannot be undone.
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete your account and remove all of your data from
                            our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteAccount}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete Account
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
                    <SelectValue placeholder="Select preferred difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "beginner",
                      "easy",
                      "intermediate",
                      "advanced",
                      "hard",
                      "expert",
                      "master",
                      "grandmaster",
                    ].map((difficulty) => (
                      <SelectItem key={difficulty} value={difficulty}>
                        <span className="capitalize">{difficulty}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  Choose your default bot difficulty for new games.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="move_input_method">Move Input Method</Label>
                <Select
                  value={settings.moveInputMethod}
                  onValueChange={(value) =>
                    setSettings({
                      ...settings,
                      moveInputMethod: value as "click" | "drag" | "both",
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select move input method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="click">Click Only</SelectItem>
                    <SelectItem value="drag">Drag Only</SelectItem>
                    <SelectItem value="both">Click and Drag</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  Choose how you want to move pieces on the board.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="white_pieces_bottom">
                  White Pieces Position
                </Label>
                <div className="flex gap-3 mt-2">
                  <Button
                    onClick={() =>
                      setSettings({ ...settings, white_pieces_bottom: true })
                    }
                    variant={
                      settings.white_pieces_bottom ? "default" : "outline"
                    }
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <Crown className="h-4 w-4 fill-current" />
                    Bottom
                  </Button>
                  <Button
                    onClick={() =>
                      setSettings({ ...settings, white_pieces_bottom: false })
                    }
                    variant={
                      !settings.white_pieces_bottom ? "default" : "outline"
                    }
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <Crown className="h-4 w-4" />
                    Top
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

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enable_confetti">Victory Confetti</Label>
                  <p className="text-sm text-muted-foreground">
                    Show confetti animation when winning a game
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <PartyPopper className="h-4 w-4 text-muted-foreground" />
                  <Switch
                    id="enable_confetti"
                    checked={settings.enable_confetti}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, enable_confetti: checked })
                    }
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto_queen">Auto-Queen Promotion</Label>
                  <p className="text-sm text-muted-foreground">
                    Instantly promote pawns to queen (skip selection modal)
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Crown className="h-4 w-4 text-muted-foreground" />
                  <Switch
                    id="auto_queen"
                    checked={settings.autoQueen}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, autoQueen: checked })
                    }
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-6 mt-6">
              <div className="space-y-2">
                <Label>Board + Piece Preset</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Quickly apply a curated board color and piece set combination.
                </p>
                <AppearancePresetGrid
                  BOARD_PIECE_PRESETS={BOARD_PIECE_PRESETS}
                  presetId={presetId}
                  setSettings={setSettings}
                  setPresetId={setPresetId}
                />
                {!presetId && (
                  <div className="mt-2 text-xs text-muted-foreground italic">
                    Custom combination
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="board_theme">Board Theme</Label>
                <Select
                  value={settings.boardTheme}
                  onValueChange={(value) =>
                    setSettings({
                      ...settings,
                      boardTheme: value,
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select board theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">
                      Auto (Match Difficulty)
                    </SelectItem>
                    {NON_DIFFICULTY_THEMES.map((theme) => (
                      <SelectItem key={theme} value={theme}>
                        {theme
                          .replace(/-/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <BoardThemePreview
                  theme={
                    settings.boardTheme === "auto"
                      ? settings.preferred_difficulty
                      : settings.boardTheme
                  }
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Choose a board color theme. &quot;Auto&quot; uses the default
                  color for the current difficulty.
                </p>
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
                <div className="mt-2 flex justify-start">
                  <div className="grid grid-cols-4 gap-2 p-2 bg-muted/30 rounded-md">
                    {["k", "q", "r", "b"].map((piece) => (
                      <div key={piece} className="w-14 h-14 flex">
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
                <p className="text-sm text-muted-foreground mt-1">
                  Select your preferred chess piece style.
                </p>
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
                  <Label htmlFor="high_contrast">High Contrast Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Improve accessibility with a high-contrast color scheme
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Contrast className="h-4 w-4 text-muted-foreground" />
                  <Switch
                    id="high_contrast"
                    checked={settings.highContrast}
                    onCheckedChange={handleHighContrastToggle}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button onClick={handleSaveSettings} disabled={loading || !isChanged}>
            Save Settings
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
