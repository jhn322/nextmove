"use client";

import { useAuth } from "@/context/auth-context";
import { useState, useEffect, useCallback, memo } from "react";
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
  Pencil,
  Trash2,
  Contrast,
  ArrowRightLeft,
  Eye,
  Highlighter,
  User,
  Gamepad2,
  MousePointer,
  Hand,
  Crosshair,
  Swords,
  Trophy,
  Award,
  Baby,
  Blocks,
  BookOpen,
  Sword,
  AlignEndHorizontal,
  AlignStartHorizontal,
  SmilePlus,
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
  DialogDescription,
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
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import dynamic from "next/dynamic";
import { Session } from "next-auth"; // Added Session import

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
  enablePreMadeMove: boolean;
  showLegalMoves: boolean;
  highlightSquare: boolean;
}

// Props for the client component
interface SettingsPageClientProps {
  session: Session | null; // Session will be passed as a prop
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

// Responsive hook for mobile
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  return isMobile;
};

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
  const isMobile = useIsMobile();
  const [showAll, setShowAll] = useState(false);
  const presetsPerRow = 4;
  const defaultRows = isMobile ? 1 : 3;
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

const MemoizedAppearancePresetGrid = React.memo(AppearancePresetGrid);

const VirtualizedAvatarGrid = dynamic(
  () => import("@/components/ui/virtualized-avatar-grid"),
  { ssr: false }
);

const FLAIRS = [
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
];

const FlairGrid = memo(
  ({ handleFlairSelect }: { handleFlairSelect: (flair: string) => void }) => (
    <ScrollArea className="h-[300px]">
      <div className="grid grid-cols-5 gap-2 p-2">
        {FLAIRS.map((emoji, index) => (
          <Button
            key={index}
            variant="ghost"
            className="h-12 text-2xl hover:bg-accent"
            onClick={() => handleFlairSelect(emoji)}
          >
            {emoji}
          </Button>
        ))}
      </div>
    </ScrollArea>
  )
);
FlairGrid.displayName = "FlairGrid";

// Zod schema for profile fields
const profileSchema = z.object({
  display_name: z.string().min(1).max(50),
  first_name: z.string().max(50),
  last_name: z.string().max(50),
  location: z.string().max(100),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

// * Country code to country name map for accessible flag alt text
const COUNTRY_CODE_TO_NAME: Record<string, string> = {
  ad: "Andorra",
  am: "Armenia",
  ar: "Argentina",
  au: "Australia",
  ba: "Bosnia and Herzegovina",
  bg: "Bulgaria",
  ca: "Canada",
  cn: "China",
  cu: "Cuba",
  cy: "Cyprus",
  cz: "Czechia",
  de: "Germany",
  dk: "Denmark",
  ec: "Ecuador",
  eng: "England",
  fi: "Finland",
  fr: "France",
  ge: "Georgia",
  gr: "Greece",
  ie: "Ireland",
  il: "Israel",
  in: "India",
  is: "Iceland",
  it: "Italy",
  jp: "Japan",
  kr: "South Korea",
  lt: "Lithuania",
  lu: "Luxembourg",
  lv: "Latvia",
  my: "Malaysia",
  no: "Norway",
  nz: "New Zealand",
  ph: "Philippines",
  pk: "Pakistan",
  ps: "Palestine",
  pt: "Portugal",
  ro: "Romania",
  rs: "Serbia",
  ru: "Russia",
  sct: "Scotland",
  se: "Sweden",
  sy: "Syria",
  tr: "Turkey",
  ua: "Ukraine",
  ug: "Uganda",
  us: "United States",
  uy: "Uruguay",
  wls: "Wales",
  none: "None",
};

export function SettingsPageClient({
  session: initialSession,
}: SettingsPageClientProps) {
  // Renamed and using props
  const { status, session: authSession, signOut, refreshSession } = useAuth(); // authSession for clarity
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
      enablePreMadeMove: true,
      showLegalMoves: true,
      highlightSquare: true,
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
  const [activeTab, setActiveTab] = useState<string>("profile");
  const [isSaving, setIsSaving] = useState(false);

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

  const difficultyIconMap: Record<string, React.ElementType> = {
    beginner: Baby,
    easy: Blocks,
    intermediate: BookOpen,
    advanced: Crosshair,
    hard: Sword,
    expert: Swords,
    master: Award,
    grandmaster: Trophy,
  };

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      display_name: settings.display_name,
      first_name: settings.first_name,
      last_name: settings.last_name,
      location: settings.location,
    },
    mode: "onChange",
  });

  const initialProfileValues = React.useRef({
    display_name: initialSession?.user?.name || "",
    first_name: initialSession?.user?.firstName || "",
    last_name: initialSession?.user?.lastName || "",
    location: initialSession?.user?.location || "",
  });

  const formValues = form.watch();
  const isProfileChanged = Object.keys(initialProfileValues.current).some(
    (key) =>
      formValues[key as keyof ProfileFormValues] !==
      initialProfileValues.current[key as keyof ProfileFormValues]
  );

  const isSettingsChanged =
    initialSettings &&
    JSON.stringify({
      ...settings,
      display_name: undefined, // Exclude form-managed fields from this specific comparison
      first_name: undefined,
      last_name: undefined,
      location: undefined,
    }) !==
      JSON.stringify({
        ...initialSettings,
        display_name: undefined,
        first_name: undefined,
        last_name: undefined,
        location: undefined,
      });

  const isChanged = isProfileChanged || isSettingsChanged;

  // Ref to skip session sync after save
  const skipNextSessionSync = React.useRef(false);

  useEffect(() => {
    // Use initialSession passed from server component for the first load
    // Then, authSession from useAuth can take over for dynamic updates if needed
    const currentSession = initialSession || authSession;

    if (isSaving) {
      return;
    }

    if (!currentSession?.user) {
      if (status === "unauthenticated") {
        router.push("/auth/login?callbackUrl=/settings");
      }
      setLoading(status === "loading");
      return;
    }

    // Skip session sync if just saved (secondary check, isSaving is primary)
    if (skipNextSessionSync.current) {
      skipNextSessionSync.current = false;
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const user = currentSession.user;

    const newSettings = {
      display_name: user.name || "",
      first_name: user.firstName || "",
      last_name: user.lastName || "",
      location: user.location || "",
      avatar_url: user.image || "/avatars/jake.webp",
      preferred_difficulty: user.preferredDifficulty || "intermediate",
      sound_enabled: user.soundEnabled !== false,
      piece_set: user.pieceSet || getPieceSet(),
      white_pieces_bottom: user.whitePiecesBottom !== false,
      show_coordinates: user.showCoordinates !== false,
      enable_animations: user.enableAnimations !== false,
      enable_confetti: user.enableConfetti !== false,
      timezone: user.timezone || "UTC",
      clock_format: (user.clockFormat === "12" ? "12" : "24") as "12" | "24",
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
      moveInputMethod: ("moveInputMethod" in user &&
      (user.moveInputMethod === "click" ||
        user.moveInputMethod === "drag" ||
        user.moveInputMethod === "both")
        ? user.moveInputMethod
        : getMoveInputMethod()) as "click" | "drag" | "both",
      boardTheme:
        "boardTheme" in user && typeof user.boardTheme === "string"
          ? user.boardTheme
          : getBoardTheme(),
      enablePreMadeMove:
        "enablePreMadeMove" in user &&
        typeof user.enablePreMadeMove === "boolean"
          ? user.enablePreMadeMove
          : true,
      showLegalMoves:
        "showLegalMoves" in user && typeof user.showLegalMoves === "boolean"
          ? user.showLegalMoves
          : true,
      highlightSquare:
        "highlightSquare" in user && typeof user.highlightSquare === "boolean"
          ? user.highlightSquare
          : true,
    };

    setSettings(newSettings);
    setInitialSettings(newSettings); // Set initial settings based on fetched user data

    // Update form defaults here
    form.reset({
      display_name: newSettings.display_name,
      first_name: newSettings.first_name,
      last_name: newSettings.last_name,
      location: newSettings.location,
    });
    initialProfileValues.current = {
      display_name: newSettings.display_name,
      first_name: newSettings.first_name,
      last_name: newSettings.last_name,
      location: newSettings.location,
    };

    setLoading(false);
  }, [initialSession, authSession, status, router, form, isSaving]);

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

  useEffect(() => {
    const match = findMatchingPreset(settings.boardTheme, settings.piece_set);
    setPresetId(match ? match.id : null);
  }, [settings.boardTheme, settings.piece_set]);

  const handleSaveSettings = async () => {
    const currentSession = initialSession || authSession;
    if (!currentSession?.user?.id) {
      setError("You need to be signed in to save settings");
      return;
    }

    setLoading(true);
    setIsSaving(true);
    setSaveMessage("");
    setError(null);

    const profileValues = form.getValues();

    const dataToSend = {
      name: profileValues.display_name,
      firstName: profileValues.first_name,
      lastName: profileValues.last_name,
      location: profileValues.location,
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
      enablePreMadeMove: settings.enablePreMadeMove,
      showLegalMoves: settings.showLegalMoves,
      highlightSquare: settings.highlightSquare,
    };

    // Set flag to skip next session sync
    skipNextSessionSync.current = true;

    try {
      const response = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
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
          // This saves to localStorage
          pieceSet: dataToSend.pieceSet,
          whitePiecesBottom: dataToSend.whitePiecesBottom,
          showCoordinates: dataToSend.showCoordinates,
          enableAnimations: dataToSend.enableAnimations,
          soundEnabled: dataToSend.soundEnabled,
          enableConfetti: dataToSend.enableConfetti,
          timezone: dataToSend.timezone,
          clockFormat: dataToSend.clockFormat as "12" | "24",
          countryFlag: dataToSend.countryFlag,
          flair: dataToSend.flair,
          highContrast: dataToSend.highContrast,
          autoQueen: dataToSend.autoQueen,
          moveInputMethod: dataToSend.moveInputMethod as
            | "click"
            | "drag"
            | "both",
          boardTheme: dataToSend.boardTheme,
        });

        setSaveMessage("Settings saved successfully");
        await refreshSession(); // Refresh session from useAuth

        // Construct the definitive state based on what was successfully sent and saved
        const successfullySavedState: SettingsState = {
          display_name: dataToSend.name,
          first_name: dataToSend.firstName,
          last_name: dataToSend.lastName,
          location: dataToSend.location,
          avatar_url: dataToSend.image,
          preferred_difficulty: dataToSend.preferredDifficulty,
          sound_enabled: dataToSend.soundEnabled,
          piece_set: dataToSend.pieceSet,
          white_pieces_bottom: dataToSend.whitePiecesBottom,
          show_coordinates: dataToSend.showCoordinates,
          enable_animations: dataToSend.enableAnimations,
          enable_confetti: dataToSend.enableConfetti,
          timezone: dataToSend.timezone,
          clock_format: dataToSend.clockFormat as "12" | "24",
          country_flag: dataToSend.countryFlag,
          flair: dataToSend.flair,
          highContrast: dataToSend.highContrast,
          autoQueen: dataToSend.autoQueen,
          moveInputMethod: dataToSend.moveInputMethod as
            | "click"
            | "drag"
            | "both",
          boardTheme: dataToSend.boardTheme,
          presetId:
            findMatchingPreset(dataToSend.boardTheme, dataToSend.pieceSet)
              ?.id || null,
          enablePreMadeMove: dataToSend.enablePreMadeMove,
          showLegalMoves: dataToSend.showLegalMoves,
          highlightSquare: dataToSend.highlightSquare,
        };

        setSettings(successfullySavedState);
        setInitialSettings(successfullySavedState);
        setPresetId(successfullySavedState.presetId || null);

        initialProfileValues.current = {
          display_name: dataToSend.name,
          first_name: dataToSend.firstName,
          last_name: dataToSend.lastName,
          location: dataToSend.location,
        };
        setTimeout(() => setSaveMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      setError("An unexpected network error occurred. Please try again.");
    } finally {
      setLoading(false);
      setIsSaving(false);
    }
  };

  const handleAvatarSelect = useCallback((avatarPath: string) => {
    setSettings((prev) => ({ ...prev, avatar_url: avatarPath }));
    setAvatarDialogOpen(false);
  }, []);

  const handleFlairSelect = useCallback((flair: string) => {
    setSettings((prev) => ({ ...prev, flair }));
    setFlairDialogOpen(false);
  }, []);

  const handleDeleteAccount = async () => {
    const currentSession = initialSession || authSession;
    if (!currentSession?.user?.id) {
      setError("You need to be signed in to delete your account");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/user/account", { method: "DELETE" });
      if (!response.ok) {
        const errorData = await response.json();
        setError(
          errorData.message || "Failed to delete account. Please try again."
        );
      } else {
        localStorage.clear();
        await signOut({ redirect: false }); // signOut from useAuth
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
      if (theme !== "high-contrast") {
        localStorage.setItem("previous-theme", theme || "system");
      }
      setTheme("high-contrast");
    } else {
      const prevTheme = localStorage.getItem("previous-theme") || "system";
      setTheme(prevTheme);
    }
  };

  useEffect(() => {
    if (theme !== "high-contrast" && settings.highContrast) {
      setSettings((prev) => ({ ...prev, highContrast: false }));
    } else if (theme === "high-contrast" && !settings.highContrast) {
      setSettings((prev) => ({ ...prev, highContrast: true }));
    }
  }, [theme, settings.highContrast]);

  const handleResetBoardAndPieces = () => {
    setSettings((prev) => ({
      ...prev,
      boardTheme: "auto",
      piece_set: "staunty",
    }));
  };

  if (loading) {
    // Simplified loading condition
    return <SettingsLoading />;
  }

  // Error display based on client-side error state
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

  // If, after loading, there\'s still no session (e.g. user logged out in another tab and useAuth caught up)
  // This check might be redundant if the main useEffect handles redirection properly, but can be a fallback.
  const currentSession = initialSession || authSession;
  if (!currentSession?.user && status !== "loading") {
    // It should have redirected in the useEffect, but as a safeguard:
    return <SettingsLoading />; // Or a message "Please sign in"
  }

  return (
    <div className="container max-w-6xl mx-auto py-12 px-4 space-y-8 min-h-screen">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger
            value="profile"
            className="flex items-center gap-2"
            aria-label="Profile"
            onClick={() => setActiveTab("profile")}
          >
            <User className="h-4 w-4 text-muted-foreground" />
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="game"
            className="flex items-center gap-2"
            aria-label="Gameplay"
            onClick={() => setActiveTab("game")}
          >
            <Gamepad2 className="h-4 w-4 text-muted-foreground" />
            Gameplay
          </TabsTrigger>
          <TabsTrigger
            value="appearance"
            className="flex items-center gap-2"
            aria-label="Appearance"
            onClick={() => setActiveTab("appearance")}
          >
            <Palette className="h-4 w-4 text-muted-foreground" />
            Appearance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>User Settings</CardTitle>
              <CardDescription>
                Manage your account settings and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Client-side error display */}
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

              <Form {...form}>
                <form
                  className="space-y-6"
                  onSubmit={form.handleSubmit(handleSaveSettings)}
                >
                  <FormField
                    control={form.control}
                    name="display_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Name</FormLabel>
                        <FormControl>
                          <Input
                            maxLength={20}
                            placeholder="Display Name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input
                            maxLength={50}
                            placeholder="First Name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="last_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input
                            maxLength={50}
                            placeholder="Last Name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input
                            maxLength={100}
                            placeholder="City, Country"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                            aria-label="Edit avatar"
                          >
                            <Avatar className="h-16 w-16 cursor-pointer border-2 border-primary/50 group-hover:border-primary transition-all">
                              <AvatarImage
                                src={settings.avatar_url}
                                alt="Avatar"
                              />
                              <AvatarFallback>
                                {settings.display_name?.charAt(0) || "?"}
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
                        </DialogTrigger>
                        <DialogContent
                          className="rounded-lg overflow-hidden box-border w-full max-w-md"
                          aria-describedby="settings-avatar-dialog-description"
                        >
                          <DialogHeader>
                            <DialogTitle>Choose Avatar</DialogTitle>
                          </DialogHeader>
                          <DialogDescription
                            id="settings-avatar-dialog-description"
                            className="sr-only"
                          >
                            Select an avatar to represent you in games
                          </DialogDescription>
                          {avatarDialogOpen && (
                            <div className="w-full h-[300px] overflow-y-auto box-border">
                              <VirtualizedAvatarGrid
                                availableAvatars={availableAvatars}
                                selectedAvatar={settings.avatar_url}
                                onSelect={handleAvatarSelect}
                                getCharacterNameFromPath={
                                  getCharacterNameFromPath
                                }
                                columnCount={
                                  typeof window !== "undefined" &&
                                  window.innerWidth <= 640
                                    ? 3
                                    : 4
                                }
                              />
                            </div>
                          )}
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
                        setSettings((prev) => ({
                          ...prev,
                          country_flag: value === "none" ? "" : value,
                        }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select country flag">
                          <div className="flex items-center gap-2">
                            <Flag className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                            {settings.country_flag ? (
                              <div className="flex items-center gap-2">
                                <Image
                                  src={`/flags/${settings.country_flag}.webp`}
                                  alt={`Flag of ${COUNTRY_CODE_TO_NAME[settings.country_flag] || settings.country_flag.toUpperCase()}`}
                                  width={20}
                                  height={12}
                                  className="h-3 w-5"
                                  style={{ width: "auto", height: "auto" }}
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
                                    src={`/flags/${flag}.webp`}
                                    alt={`Flag of ${COUNTRY_CODE_TO_NAME[flag] || flag.toUpperCase()}`}
                                    width={20}
                                    height={12}
                                    className="h-3 w-5"
                                    style={{ width: "auto", height: "auto" }}
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
                    <Dialog
                      open={flairDialogOpen}
                      onOpenChange={setFlairDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full flex items-center justify-start gap-3 p-3 text-left h-auto"
                          aria-label="Choose or change your flair"
                        >
                          <SmilePlus className="h-4 w-4 text-muted-foreground flex-shrink-0 -mr-2" />
                          <span
                            className="text-2xl min-w-[28px] text-center"
                            aria-hidden="true"
                          >
                            {settings.flair || "✨"}
                          </span>
                          <span className="flex-grow font-normal -ml-2 text-sm">
                            {settings.flair ? "Change Flair" : "Choose a flair"}
                          </span>
                          <Pencil className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Choose Flair</DialogTitle>
                        </DialogHeader>
                        {flairDialogOpen && (
                          <FlairGrid handleFlairSelect={handleFlairSelect} />
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      value={settings.timezone}
                      onValueChange={(value) =>
                        setSettings((prev) => ({ ...prev, timezone: value }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select timezone">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                            <span className="truncate">
                              {settings.timezone}
                            </span>
                          </div>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {Intl.supportedValuesOf("timeZone").map((tz) => (
                          <SelectItem key={tz} value={tz}>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{tz}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clock_format">Clock Format</Label>
                    <div className="flex gap-3 mt-2">
                      <Button
                        type="button"
                        onClick={() =>
                          setSettings((prev) => ({
                            ...prev,
                            clock_format: "12",
                          }))
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
                        type="button"
                        onClick={() =>
                          setSettings((prev) => ({
                            ...prev,
                            clock_format: "24",
                          }))
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
                    <h3 className="text-lg font-medium text-red-700 dark:text-red-400 mb-4">
                      Danger Zone
                    </h3>
                    <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">Delete Account</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Permanently delete your account and all associated
                            data. This action cannot be undone.
                          </p>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="flex items-center gap-2"
                              aria-label="Delete account"
                            >
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Trash2 className="h-4 w-4" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Delete Account
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Are you absolutely sure?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will
                                permanently delete your account and remove all
                                of your data from our servers.
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
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                onClick={form.handleSubmit(handleSaveSettings)}
                disabled={loading || !isChanged}
              >
                Save Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="game">
          <Card>
            <CardHeader>
              <CardTitle>Gameplay Settings</CardTitle>
              <CardDescription>
                Customize your gameplay experience.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 mt-6">
              <div className="space-y-2">
                <Label htmlFor="preferred_difficulty">
                  Preferred Difficulty
                </Label>
                <Select
                  value={settings.preferred_difficulty}
                  onValueChange={(value) =>
                    setSettings((prev) => ({
                      ...prev,
                      preferred_difficulty: value,
                    }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select preferred difficulty">
                      <div className="flex items-center gap-2">
                        {(() => {
                          const Icon =
                            difficultyIconMap[settings.preferred_difficulty];
                          return Icon ? (
                            <Icon className="h-4 w-4 text-muted-foreground" />
                          ) : null;
                        })()}
                        <span className="capitalize">
                          {settings.preferred_difficulty}
                        </span>
                      </div>
                    </SelectValue>
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
                        <div className="flex items-center gap-2">
                          {(() => {
                            const Icon = difficultyIconMap[difficulty];
                            return Icon ? (
                              <Icon className="h-4 w-4 text-muted-foreground" />
                            ) : null;
                          })()}
                          <span className="capitalize">{difficulty}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  Choose your preferred difficulty level.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="move_input_method">Move Input Method</Label>
                <Select
                  value={settings.moveInputMethod}
                  onValueChange={(value) =>
                    setSettings((prev) => ({
                      ...prev,
                      moveInputMethod: value as "click" | "drag" | "both",
                    }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select move input method">
                      <div className="flex items-center gap-2">
                        {settings.moveInputMethod === "click" && (
                          <MousePointer className="h-4 w-4 text-muted-foreground" />
                        )}
                        {settings.moveInputMethod === "drag" && (
                          <Hand className="h-4 w-4 text-muted-foreground" />
                        )}
                        {settings.moveInputMethod === "both" && (
                          <>
                            <MousePointer className="h-4 w-4 text-muted-foreground" />
                            <Hand className="h-4 w-4 text-muted-foreground" />
                          </>
                        )}
                        <span>
                          {settings.moveInputMethod === "both"
                            ? "Click and Drag"
                            : settings.moveInputMethod.charAt(0).toUpperCase() +
                              settings.moveInputMethod.slice(1)}
                        </span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="click">
                      <div className="flex items-center gap-2">
                        <MousePointer className="h-4 w-4 text-muted-foreground" />
                        Click Only
                      </div>
                    </SelectItem>
                    <SelectItem value="drag">
                      <div className="flex items-center gap-2">
                        <Hand className="h-4 w-4 text-muted-foreground" />
                        Drag Only
                      </div>
                    </SelectItem>
                    <SelectItem value="both">
                      <div className="flex items-center gap-2">
                        <MousePointer className="h-4 w-4 text-muted-foreground" />
                        <Hand className="h-4 w-4 text-muted-foreground" />
                        Click and Drag
                      </div>
                    </SelectItem>
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
                      setSettings((prev) => ({
                        ...prev,
                        white_pieces_bottom: true,
                      }))
                    }
                    variant={
                      settings.white_pieces_bottom ? "default" : "outline"
                    }
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <AlignEndHorizontal className="h-4 w-4" />
                    Bottom
                  </Button>
                  <Button
                    onClick={() =>
                      setSettings((prev) => ({
                        ...prev,
                        white_pieces_bottom: false,
                      }))
                    }
                    variant={
                      !settings.white_pieces_bottom ? "default" : "outline"
                    }
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <AlignStartHorizontal className="h-4 w-4" />
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
                      setSettings((prev) => ({
                        ...prev,
                        sound_enabled: checked,
                      }))
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
                      setSettings((prev) => ({
                        ...prev,
                        enable_animations: checked,
                      }))
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
                      setSettings((prev) => ({
                        ...prev,
                        enable_confetti: checked,
                      }))
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
                      setSettings((prev) => ({ ...prev, autoQueen: checked }))
                    }
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enablePreMadeMove">Pre-Made Move</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow making a move before your turn (pre-move)
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                  <Switch
                    id="enablePreMadeMove"
                    checked={settings.enablePreMadeMove}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        enablePreMadeMove: checked,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="showLegalMoves">Show Legal Moves</Label>
                  <p className="text-sm text-muted-foreground">
                    Highlight all legal moves for the selected piece
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <Switch
                    id="showLegalMoves"
                    checked={settings.showLegalMoves}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        showLegalMoves: checked,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="highlightSquare">
                    Highlight Moves & Selection
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Show colored highlight for last move and currently selected
                    piece. Disabling removes all move/selection highlights.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Highlighter className="h-4 w-4 text-muted-foreground" />
                  <Switch
                    id="highlightSquare"
                    checked={settings.highlightSquare}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        highlightSquare: checked,
                      }))
                    }
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                onClick={form.handleSubmit(handleSaveSettings)}
                disabled={loading || !isChanged}
              >
                Save Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>
                Personalize the look and feel of your chess experience.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 mt-6">
              <div className="space-y-2">
                <Label>Board + Piece Preset</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Quickly apply a curated board color and piece set combination.
                </p>
                <MemoizedAppearancePresetGrid
                  BOARD_PIECE_PRESETS={BOARD_PIECE_PRESETS}
                  presetId={presetId}
                  setSettings={setSettings}
                  setPresetId={setPresetId}
                />
                {presetId === null &&
                  !(
                    settings.boardTheme === "auto" &&
                    settings.piece_set === "staunty"
                  ) && (
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
                    setSettings((prevSettings) => ({
                      ...prevSettings,
                      boardTheme: value,
                    }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select board theme">
                      <div className="flex items-center gap-2">
                        <Palette className="h-4 w-4 text-muted-foreground" />
                        <span className="capitalize truncate">
                          {settings.boardTheme === "auto"
                            ? "Auto (Match Difficulty)"
                            : settings.boardTheme.replace(/-/g, " ")}
                        </span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">
                      <div className="flex items-center gap-2">
                        <Palette className="h-4 w-4 text-muted-foreground" />
                        Auto (Match Difficulty)
                      </div>
                    </SelectItem>
                    {NON_DIFFICULTY_THEMES.map((theme) => (
                      <SelectItem key={theme} value={theme}>
                        <div className="flex items-center gap-2">
                          <Palette className="h-4 w-4 text-muted-foreground" />
                          {theme
                            .replace(/-/g, " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </div>
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
                    setSettings((prevSettings) => ({
                      ...prevSettings,
                      piece_set: value,
                    }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select piece set">
                      <div className="flex items-center gap-2">
                        <Palette className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                        <span className="capitalize truncate">
                          {settings.piece_set.replace("_", " ")}
                          {settings.piece_set === "staunty" && " (Default)"}
                        </span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {pieceSets.map((set) => (
                      <SelectItem key={set} value={set}>
                        <div className="flex items-center gap-2">
                          <Palette className="h-4 w-4 text-muted-foreground" />
                          <span className="capitalize">
                            {set.replace("_", " ")}
                            {set === "staunty" && " (Default)"}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="mt-2 flex justify-start">
                  <div className="grid grid-cols-4 gap-2 p-2 bg-muted/30 rounded-lg">
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
                      setSettings((prev) => ({
                        ...prev,
                        show_coordinates: checked,
                      }))
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

              <div className="mt-6 pt-6 border-t">
                <Label className="text-base font-medium">
                  Reset Appearance Defaults
                </Label>
                <p className="text-sm text-muted-foreground mt-1 mb-3">
                  Reset board theme and piece set to default.
                </p>
                <Button
                  variant="outline"
                  onClick={handleResetBoardAndPieces}
                  className="flex items-center gap-2"
                >
                  <Palette className="h-4 w-4 text-muted-foreground" />
                  Reset Board & Pieces
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                onClick={form.handleSubmit(handleSaveSettings)}
                disabled={loading || !isChanged}
              >
                Save Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default SettingsPageClient;
