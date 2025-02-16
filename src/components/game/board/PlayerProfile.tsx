import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PlayerProfileProps {
  difficulty: string;
  isBot: boolean;
  rating?: number;
  capturedPieces?: string[];
  flag?: string;
}

const PlayerProfile = ({
  difficulty,
  isBot,
  rating = 1500,
  capturedPieces = [],
  flag = "US",
}: PlayerProfileProps) => {
  const difficultyAnimals = {
    beginner: "deer",
    easy: "rabbit",
    intermediate: "fox",
    advanced: "wolf",
    hard: "lion",
    expert: "tiger",
    master: "eagle",
    grandmaster: "goat",
  };

  const capitalizedDifficulty =
    difficulty.charAt(0).toUpperCase() + difficulty.slice(1);

  return (
    <Card className="w-full sm:w-[240px] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <CardHeader className="flex flex-row items-center gap-3 space-y-0 p-4">
        <Avatar className="h-12 w-12 sm:h-14 sm:w-14">
          <AvatarImage
            src={
              isBot
                ? `/animals/${
                    difficultyAnimals[
                      difficulty as keyof typeof difficultyAnimals
                    ]
                  }.png`
                : "/default-pfp.png"
            }
            alt={isBot ? `${capitalizedDifficulty} Bot` : "Player"}
            className="object-contain bg-gray-800 dark:bg-gray-700"
          />
          <AvatarFallback>
            {isBot ? difficulty.substring(0, 2).toUpperCase() : "P"}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-1">
          <div className="text-sm font-medium leading-none">
            {isBot ? `${capitalizedDifficulty} Bot` : "Player"}
          </div>
          <CardDescription className="text-xs">
            Rating: {rating} {flag && `• ${flag}`}
          </CardDescription>
        </div>
      </CardHeader>
      {capturedPieces.length > 0 && (
        <CardContent className="p-4 pt-0">
          <div className="flex flex-wrap gap-1">
            {capturedPieces.map((piece, index) => (
              <div key={index} className="w-4 h-4"></div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default PlayerProfile;
