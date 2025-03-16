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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Bot } from "@/components/game/data/bots";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
}: BotSelectionPanelProps) => {
  const router = useRouter();
  const [isRandomColor, setIsRandomColor] = useState(false);
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
    setIsRandomColor(true);
    const randomColor = Math.random() < 0.5 ? "w" : "b";
    onColorChange(randomColor);
  };

  const handleSpecificColor = (color: "w" | "b") => {
    setIsRandomColor(false);
    onColorChange(color);
  };

  // Handle bot selection without direct navigation
  const handleBotSelect = (bot: Bot) => {
    onSelectBot(bot);
  };

  const handlePlayGame = () => {
    // If random color is selected, roll for a new color before starting the game
    if (isRandomColor) {
      const randomColor = Math.random() < 0.5 ? "w" : "b";
      onColorChange(randomColor);
    }

    if (selectedBot && onPlayGame) {
      onPlayGame();
    } else if (selectedBot && useDirectNavigation) {
      router.push(`/play/${difficulty}/${selectedBot.id}`);
    }
  };

  // Ensure the first bot is selected by default and has an ID
  useEffect(() => {
    if (bots.length > 0 && !selectedBot) {
      onSelectBot(bots[0]);
    } else if (selectedBot && !selectedBot.id && bots.length > 0) {
      // Find the matching bot to get its ID
      const matchingBot = bots.find((bot) => bot.name === selectedBot.name);
      if (matchingBot) {
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
        <CardHeader className="p-3 pb-2 lg:p-4 lg:pb-2">
          <CardTitle className="text-lg lg:text-xl">
            Select {grammar} {capitalizedDifficulty} Bot
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0 lg:p-4 lg:pt-0">
          {/* Mobile Layout (< 1024px) */}
          <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {bots.map((bot) => (
              <div
                key={bot.name}
                className="flex items-center gap-2 p-2 rounded-md hover:bg-accent/50 transition-colors"
              >
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarImage src={bot.image} alt={bot.name} />
                  <AvatarFallback>{bot.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{bot.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Rating: {bot.rating}
                  </div>
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
                  variant={
                    selectedBot?.name === bot.name ? "default" : "outline"
                  }
                >
                  {selectedBot?.name === bot.name ? "Selected" : "Select"}
                </Button>
              </div>
            ))}
          </div>

          {/* Desktop Layout (≥ 1024px) */}
          <div className="hidden lg:flex flex-col space-y-3">
            {bots.map((bot) => (
              <div key={bot.name} className="flex items-center gap-3">
                <Avatar className="h-12 w-12 flex-shrink-0">
                  <AvatarImage src={bot.image} alt={bot.name} />
                  <AvatarFallback>{bot.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium truncate max-w-[100px]">
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
                  <div className="text-xs">Rating: {bot.rating}</div>
                </div>
                <Button
                  className="flex-shrink-0 ml-auto"
                  onClick={() => handleBotSelect(bot)}
                  variant={
                    selectedBot?.name === bot.name ? "default" : "outline"
                  }
                >
                  {selectedBot?.name === bot.name ? "Selected" : "Select"}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Color Selection */}
      <Card className="border-0 shadow-none">
        <CardHeader className="p-3 pb-2 lg:p-4 lg:pb-2">
          <CardTitle className="flex items-center gap-2 text-md">
            Play As
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Choose which color pieces you want to play with. You&apos;ll
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
            <Button
              onClick={handleRandomColor}
              variant={isRandomColor ? "default" : "outline"}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <Shuffle className="h-4 w-4 flex-shrink-0" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Difficulty Selection */}
      <Card className="border-0 shadow-none">
        <CardHeader className="p-3 pb-2 lg:p-4 lg:pb-2">
          <CardTitle className="flex items-center gap-2 text-md">
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
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {difficulties.map((diff) => {
                const { icon: Icon, color } =
                  difficultyIcons[diff as keyof typeof difficultyIcons];
                return (
                  <SelectItem key={diff} value={diff}>
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${color}`} />
                      <span className="capitalize">{diff}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Play Button */}
      <Button
        className="w-full flex items-center justify-center gap-2 mt-4"
        size="lg"
        onClick={handlePlayGame}
        disabled={!selectedBot}
      >
        <Play className="h-4 w-4" />
        Play
      </Button>
    </div>
  );
};

export default BotSelectionPanel;
