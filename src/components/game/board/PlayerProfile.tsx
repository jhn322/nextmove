import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot } from "@/components/game/data/bots";

interface PlayerProfileProps {
  difficulty: string;
  isBot: boolean;
  rating?: number;
  capturedPieces?: string[];
  flag?: string;
  selectedBot?: Bot | null;
}

const PlayerProfile = ({
  difficulty,
  isBot,
  rating = 1500,
  capturedPieces = [],
  flag = "US",
  selectedBot,
}: PlayerProfileProps) => {
  const capitalizedDifficulty =
    difficulty.charAt(0).toUpperCase() + difficulty.slice(1);

  return (
    <Card className=" sm:w-[180px] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <CardHeader className="flex flex-row items-center gap-2 space-y-0 p-2">
        <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
          <AvatarImage
            src={isBot && selectedBot ? selectedBot.image : "/default-pfp.png"}
            alt={
              isBot
                ? selectedBot?.name || `${capitalizedDifficulty} Bot`
                : "Player"
            }
            className="object-contain bg-gray-800 dark:bg-gray-700"
          />
          <AvatarFallback>
            {isBot ? difficulty.substring(0, 2).toUpperCase() : "P"}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-0.5">
          <div className="text-[12px] font-medium leading-none">
            {isBot
              ? selectedBot?.name || `${capitalizedDifficulty} Bot`
              : "Player"}
          </div>
          <CardDescription className="text-[11px]">
            Rating: {isBot && selectedBot ? selectedBot.rating : rating}{" "}
            {flag && `• ${flag}`}
          </CardDescription>
        </div>
      </CardHeader>
      {capturedPieces.length > 0 && (
        <CardContent className="p-1 pt-0">
          <div className="flex flex-wrap gap-0.5">
            {capturedPieces.map((piece, index) => (
              <div key={index} className="w-2 h-2"></div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default PlayerProfile;
