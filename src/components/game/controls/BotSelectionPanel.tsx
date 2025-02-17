import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
  difficulty: string;
  bots: Bot[];
  onSelectBot: (bot: Bot) => void;
}

const BotSelectionPanel = ({
  difficulty,
  bots,
  onSelectBot,
}: BotSelectionPanelProps) => {
  const capitalizedDifficulty =
    difficulty.charAt(0).toUpperCase() + difficulty.slice(1);

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
    </div>
  );
};

export default BotSelectionPanel;
