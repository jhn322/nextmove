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
  Swords,
  Sword,
  Crosshair,
  Target,
  Trophy,
  Award,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Bot {
  name: string;
  image: string;
  rating: number;
  description: string;
  skillLevel: number;
  depth: number;
  moveTime: number;
}

interface BotSelectionPanelProps {
  bots: Bot[];
  onSelectBot: (bot: Bot) => void;
  difficulty: string;
  onDifficultyChange: (difficulty: string) => void;
}

const BotSelectionPanel = ({
  bots,
  onSelectBot,
  difficulty,
  onDifficultyChange,
}: BotSelectionPanelProps) => {
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
  const capitalizedDifficulty =
    difficulty.charAt(0).toUpperCase() + difficulty.slice(1);

  const difficultyIcons = {
    beginner: { icon: Baby, color: "text-emerald-500" },
    easy: { icon: Gamepad2, color: "text-green-500" },
    intermediate: { icon: Swords, color: "text-cyan-500" },
    advanced: { icon: Sword, color: "text-blue-500" },
    hard: { icon: Crosshair, color: "text-violet-500" },
    expert: { icon: Target, color: "text-purple-500" },
    master: { icon: Award, color: "text-orange-500" },
    grandmaster: { icon: Trophy, color: "text-red-500" },
  };

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-4">
      <Card className="border-0 shadow-none">
        <CardHeader className="p-4 pb-2">
          <CardTitle>Select a {capitalizedDifficulty} Bot</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-4">
          {bots.map((bot) => (
            <div key={bot.name} className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={bot.image} alt={bot.name} />
                <AvatarFallback>{bot.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="text-sm font-medium">{bot.name}</div>
                {/* <div className="text-xs text-muted-foreground">
                  {bot.description}
                </div> */}
                <div className="text-xs">Rating: {bot.rating}</div>
              </div>
              <Button onClick={() => onSelectBot(bot)}>Select</Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Difficulty Dropdown */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium">
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
        </div>
        <Select value={difficulty} onValueChange={onDifficultyChange}>
          <SelectTrigger className="w-full">
            <SelectValue>
              <div className="flex items-center gap-2">
                {(() => {
                  const { icon: Icon, color } =
                    difficultyIcons[difficulty as keyof typeof difficultyIcons];
                  return <Icon className={`h-4 w-4 flex-shrink-0 ${color}`} />;
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
      </div>
    </div>
  );
};

export default BotSelectionPanel;
