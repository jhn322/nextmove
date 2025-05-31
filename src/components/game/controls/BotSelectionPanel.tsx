import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Info,
  Baby,
  Gamepad2,
  BookOpen,
  Sword,
  Crosshair,
  Target,
  Trophy,
  Award,
  Crown,
  Shuffle,
  Play,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Bot, BOTS_BY_DIFFICULTY } from "@/components/game/data/bots";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import EloBadge from "@/components/ui/elo-badge";

interface BotSelectionPanelProps {
  bots: Bot[];
  onSelectBot: (bot: Bot | (Bot & { difficulty: string })) => void;
  difficulty: string;
  onDifficultyChange: (difficulty: string) => void;
  selectedBot: Bot | null;
  playerColor: "w" | "b";
  onColorChange: (color: "w" | "b") => void;
  useDirectNavigation?: boolean;
  onPlayGame?: () => void;
  beatenBots?: Array<{ name: string; difficulty: string; id: number }>;
}

const BotSelectionPanel = ({
  bots,
  onSelectBot,
  difficulty,
  onDifficultyChange,
  selectedBot,
  playerColor,
  onColorChange,
  useDirectNavigation = false,
  onPlayGame,
  beatenBots = [],
}: BotSelectionPanelProps) => {
  const router = useRouter();
  const [isRandomColor, setIsRandomColor] = useState(false);
  const [isShufflingColor, setIsShufflingColor] = useState(false);
  const randomButtonJustClicked = useRef(false);

  const difficulties = [
    "beginner",
    "easy",
    "intermediate",
    "advanced",
    "hard",
    "expert",
    "master",
    "grandmaster",
  ];

  const getEloRange = (difficulty: string) => {
    const difficultyBots =
      BOTS_BY_DIFFICULTY[difficulty as keyof typeof BOTS_BY_DIFFICULTY];
    if (!difficultyBots || difficultyBots.length === 0) return "N/A";

    const ratings = difficultyBots.map((bot) => bot.rating);
    const minRating = Math.min(...ratings);
    const maxRating = Math.max(...ratings);

    return `${minRating}-${maxRating}`;
  };

  // * Check if a bot has been beaten
  const isBotBeaten = (botName: string) => {
    return beatenBots.some((bot) => bot.name === botName);
  };

  // Determine if the word starts with a vowel
  const getGrammar = (word: string) => {
    return /^[aeiou]/i.test(word) ? "an" : "a";
  };

  const capitalizedDifficulty =
    difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  const grammar = getGrammar(difficulty);

  const difficultyIcons = {
    beginner: { icon: Baby, color: "text-emerald-500" },
    easy: { icon: Gamepad2, color: "text-green-500" },
    intermediate: { icon: BookOpen, color: "text-cyan-500" },
    advanced: { icon: Sword, color: "text-blue-500" },
    hard: { icon: Crosshair, color: "text-violet-500" },
    expert: { icon: Target, color: "text-purple-500" },
    master: { icon: Award, color: "text-orange-500" },
    grandmaster: { icon: Trophy, color: "text-red-500" },
  };

  // Handle random color selection
  const handleRandomColor = () => {
    if (isShufflingColor) return;
    randomButtonJustClicked.current = true;
    setIsShufflingColor(true);
    setIsRandomColor(true);
    setTimeout(() => {
      const randomColor = Math.random() < 0.5 ? "w" : "b";
      onColorChange(randomColor);
      setIsShufflingColor(false);
      randomButtonJustClicked.current = false;
    }, 500);
  };

  // Handle specific color selection
  const handleSpecificColor = (color: "w" | "b") => {
    setIsRandomColor(false);
    onColorChange(color);
  };

  const handleBotSelect = (bot: Bot) => {
    // Preserve the bot's ID
    if (!bot.id) {
      console.error("Bot is missing ID:", bot);
    }

    onSelectBot({
      ...bot,
      id: bot.id,
    });
  };

  const handlePlayGame = () => {
    if (randomButtonJustClicked.current) {
      return;
    }

    // If random color is selected, roll for a new color before starting the game
    if (isRandomColor) {
      const randomColor = Math.random() < 0.5 ? "w" : "b";
      onColorChange(randomColor);
    }

    if (!selectedBot || !selectedBot.id) {
      console.error("No bot selected or bot missing ID:", selectedBot);
      if (bots.length > 0) {
        const firstBot = bots[0];
        onSelectBot({
          ...firstBot,
          id: firstBot.id,
        });

        if (useDirectNavigation) {
          const url = `/play/${difficulty}/${firstBot.id}`;
          router.push(url);
          return;
        }
      } else {
        return;
      }
    }

    if (useDirectNavigation && selectedBot && selectedBot.id) {
      // Navigate to the specific bot ID
      const url = `/play/${difficulty}/${selectedBot.id}`;
      router.push(url);
    } else if (onPlayGame) {
      onPlayGame();
    }
  };

  // Ensure the first bot is selected by default and has an ID
  useEffect(() => {
    if (bots.length > 0 && !selectedBot) {
      const firstBot = bots[0];
      if (!firstBot.id) {
        console.error("First bot is missing ID:", firstBot);
      }

      onSelectBot({
        ...firstBot,
        id: firstBot.id,
      });
    } else if (selectedBot && !selectedBot.id && bots.length > 0) {
      // Find the matching bot to get its ID
      const matchingBot = bots.find((bot) => bot.name === selectedBot.name);
      if (matchingBot) {
        if (!matchingBot.id) {
          console.error("Matching bot is missing ID:", matchingBot);
        }

        onSelectBot({
          ...selectedBot,
          id: matchingBot.id,
        });
      }
    }
  }, [bots, selectedBot, onSelectBot]);

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-3 w-full lg:p-4">
      <Card className="border-0 shadow-none">
        <CardHeader className="p-3 pb-3 lg:p-4 lg:pb-4 border-b border-border/30">
          <CardTitle className="text-lg lg:text-xl font-semibold">
            Select {grammar} {capitalizedDifficulty} Bot
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-3 lg:p-4 lg:pt-4 mt-0">
          {/* Mobile Layout (< 1024px) */}
          <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 py-2">
            {bots.map((bot) => (
              <div
                key={bot.name}
                className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => handleBotSelect(bot)}
              >
                <div className="relative">
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarImage src={bot.image} alt={bot.name} />
                    <AvatarFallback>{bot.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {isBotBeaten(bot.name) && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5">
                            <CheckCircle2 className="h-3 w-3 text-white" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>Bot defeated</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div
                    className="text-sm font-medium truncate"
                    title={bot.name}
                  >
                    {bot.name}
                  </div>
                  <EloBadge elo={bot.rating} className="mt-0.5" />
                  <Image
                    src={bot.flag}
                    alt={`${bot.name} flag`}
                    className="w-5 h-3 mt-1"
                    width={20}
                    height={12}
                  />
                </div>
                <Button
                  size="sm"
                  onClick={() => handleBotSelect(bot)}
                  variant={selectedBot?.id === bot.id ? "default" : "outline"}
                >
                  {selectedBot?.id === bot.id ? "Selected" : "Select"}
                </Button>
              </div>
            ))}
          </div>

          {/* Desktop Layout (≥ 1024px) */}
          <div className="hidden lg:flex flex-col space-y-1 py-2">
            {bots.map((bot) => (
              <div
                key={bot.name}
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => handleBotSelect(bot)}
              >
                <div className="relative">
                  <Avatar className="h-12 w-12 flex-shrink-0">
                    <AvatarImage src={bot.image} alt={bot.name} />
                    <AvatarFallback>{bot.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {isBotBeaten(bot.name) && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5">
                            <CheckCircle2 className="h-4 w-4 text-white" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>Bot defeated</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="text-sm font-medium truncate max-w-[100px]"
                      title={bot.name}
                    >
                      {bot.name}
                    </span>
                    <div className="flex-shrink-0">
                      <Image
                        src={bot.flag}
                        alt={`${bot.name} flag`}
                        className="w-5 h-3"
                        width={20}
                        height={12}
                      />
                    </div>
                  </div>
                  <EloBadge elo={bot.rating} className="mt-0.5" />
                </div>
                <Button
                  className="flex-shrink-0 ml-auto"
                  onClick={() => handleBotSelect(bot)}
                  variant={selectedBot?.id === bot.id ? "default" : "outline"}
                >
                  {selectedBot?.id === bot.id ? "Selected" : "Select"}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Color Selection */}
      <div className="h-px bg-border/30 my-3 lg:my-4" />

      <Card className="border-0 shadow-none">
        <CardHeader className="p-3 pb-2 lg:p-4 lg:pb-2">
          <CardTitle className="flex items-center gap-2 text-md font-semibold">
            Play As
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Choose which piece color you want to play as. You&apos;ll
                    always move first, regardless of color.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0 lg:p-4 lg:pt-0">
          <div className="flex gap-2">
            <Button
              onClick={() => handleSpecificColor("w")}
              variant={
                playerColor === "w" && !isRandomColor ? "default" : "outline"
              }
              className="flex-1 flex items-center justify-center gap-2"
            >
              <Crown className="h-4 w-4 flex-shrink-0 fill-current" />
              <span className="truncate">White</span>
            </Button>
            <Button
              onClick={() => handleSpecificColor("b")}
              variant={
                playerColor === "b" && !isRandomColor ? "default" : "outline"
              }
              className="flex-1 flex items-center justify-center gap-2"
            >
              <Crown className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">Black</span>
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleRandomColor}
                    variant={isRandomColor ? "default" : "outline"}
                    className="flex-1 flex items-center justify-center gap-2"
                    disabled={isShufflingColor}
                    aria-label="Shuffle piece color"
                  >
                    {isShufflingColor ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Shuffle className="h-4 w-4 flex-shrink-0" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Random Piece Color</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>

      {/* Difficulty Selection */}
      <div className="h-px bg-border/30 my-3 lg:my-4" />

      <Card className="border-0 shadow-none">
        <CardHeader className="p-3 pb-2 lg:p-4 lg:pb-2">
          <CardTitle className="flex items-center gap-2 text-md font-semibold">
            Difficulty category
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Change the skill level category of the bot.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0 lg:p-4 lg:pt-0">
          <Select value={difficulty} onValueChange={onDifficultyChange}>
            <SelectTrigger className="w-full">
              <SelectValue>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const { icon: Icon, color } =
                        difficultyIcons[
                          difficulty as keyof typeof difficultyIcons
                        ];
                      return (
                        <Icon className={`h-4 w-4 flex-shrink-0 ${color}`} />
                      );
                    })()}
                    <span className="capitalize truncate">{difficulty}</span>
                  </div>
                  <span className="text-xs text-muted-foreground ml-2">
                    ELO {getEloRange(difficulty)}
                  </span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {difficulties.map((diff) => {
                const { icon: Icon, color } =
                  difficultyIcons[diff as keyof typeof difficultyIcons];
                const eloRange = getEloRange(diff);
                return (
                  <SelectItem key={diff} value={diff}>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${color}`} />
                        <span className="capitalize">{diff}</span>
                      </div>
                      <span className="text-xs text-muted-foreground ml-4">
                        ELO {eloRange}
                      </span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Play Button */}
      <div className="h-px bg-border/30 my-3 lg:my-4" />

      <Button
        className="w-full flex items-center justify-center gap-2 mt-4 text-white bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 shadow-md hover:shadow-lg transition-all duration-300"
        size="lg"
        onClick={handlePlayGame}
        disabled={!selectedBot}
      >
        <Play className="h-4 w-4" />
        <span className="text-lg">Play</span>
      </Button>
      {selectedBot && (
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Pressing &apos;Play&apos; will start the game with the selected bot
          and chosen options.
        </p>
      )}
    </div>
  );
};

export default BotSelectionPanel;
