"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { supabase, GameHistory } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trophy, X, Minus, Clock, History, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const HistoryPage = () => {
  const { status, session } = useAuth();
  const [gameHistory, setGameHistory] = useState<GameHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGameHistory = async () => {
      if (status === "authenticated" && session?.user?.id) {
        setIsLoading(true);
        setError(null);

        try {
          const { data, error } = await supabase
            .from("game_history")
            .select("*")
            .filter("user_id", "eq", session.user.id)
            .order("date", { ascending: false });

          if (error) {
            console.error("Error fetching game history:", error);
            setMessage("Failed to load game history");
            setError(error.message);
          } else if (data && data.length > 0) {
            setGameHistory(data as GameHistory[]);
          } else {
            setMessage("No games found in your history");
          }
        } catch (error: unknown) {
          console.error("Unexpected error:", error);
          setError(
            error instanceof Error
              ? error.message
              : "An unexpected error occurred"
          );
        } finally {
          setIsLoading(false);
        }
      } else if (status === "unauthenticated") {
        setIsLoading(false);
      }
    };

    fetchGameHistory();
  }, [status, session]);

  const addSampleGames = async () => {
    if (!session?.user?.id) return;

    setIsLoading(true);
    setError(null);

    const sampleGames = [
      {
        user_id: session.user.id,
        opponent: "AI (Easy)",
        result: "win",
        date: new Date(Date.now() - 86400000 * 2).toISOString(),
        moves_count: 24,
        time_taken: 180,
        difficulty: "easy",
      },
      {
        user_id: session.user.id,
        opponent: "AI (Medium)",
        result: "loss",
        date: new Date(Date.now() - 86400000).toISOString(),
        moves_count: 32,
        time_taken: 240,
        difficulty: "medium",
      },
      {
        user_id: session.user.id,
        opponent: "AI (Hard)",
        result: "draw",
        date: new Date().toISOString(), // today
        moves_count: 40,
        time_taken: 300,
        difficulty: "hard",
      },
    ];

    try {
      const { error: permissionCheckError } = await supabase
        .from("game_history")
        .select("id")
        .limit(1);

      if (permissionCheckError) {
        setError(
          "You don't have permission to add game history records. Please contact support."
        );
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("game_history")
        .insert(sampleGames)
        .select();

      if (error) {
        console.error("Error adding sample games:", error);
        setMessage("Failed to add sample games");
        setError(
          error instanceof Error ? error.message : "Failed to add sample games"
        );
      } else if (data) {
        setGameHistory(data as GameHistory[]);
        setMessage("Sample games added successfully");
      }
    } catch (error: unknown) {
      console.error("Unexpected error:", error);
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getResultIcon = (result: string) => {
    switch (result) {
      case "win":
        return <Trophy className="h-4 w-4 text-yellow-500" />;
      case "loss":
        return <X className="h-4 w-4 text-red-500" />;
      case "draw":
        return <Minus className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  if (status === "loading" || isLoading) {
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
              Please sign in to view your game history.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <History className="h-6 w-6" /> Game History
          </CardTitle>
          <CardDescription>
            View your past games and performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {gameHistory.length === 0 ? (
            <div className="text-center py-8">
              <p className="mb-4">
                {message || "No games found in your history."}
              </p>
              <Button onClick={addSampleGames} disabled={isLoading}>
                Add Sample Games
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Opponent</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Moves</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gameHistory.map((game) => (
                    <TableRow key={game.id}>
                      <TableCell>
                        {format(new Date(game.date), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>{game.opponent}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "font-medium",
                            game.difficulty === "beginner" &&
                              "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                            game.difficulty === "easy" &&
                              "bg-green-500/10 text-green-500 border-green-500/20",
                            game.difficulty === "medium" &&
                              "bg-blue-500/10 text-blue-500 border-blue-500/20",
                            game.difficulty === "hard" &&
                              "bg-orange-500/10 text-orange-500 border-orange-500/20",
                            game.difficulty === "expert" &&
                              "bg-red-500/10 text-red-500 border-red-500/20"
                          )}
                        >
                          {game.difficulty.charAt(0).toUpperCase() +
                            game.difficulty.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {getResultIcon(game.result)}
                          <span
                            className={cn(
                              "capitalize",
                              game.result === "win" && "text-yellow-500",
                              game.result === "loss" && "text-red-500",
                              game.result === "draw" && "text-blue-500"
                            )}
                          >
                            {game.result}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{game.moves_count}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          {formatTime(game.time_taken)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HistoryPage;
