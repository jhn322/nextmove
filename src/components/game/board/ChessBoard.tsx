"use client";

import { useState, useEffect } from "react";
import { useStockfish } from "../../../hooks/useStockfish";
import { STORAGE_KEY, DEFAULT_STATE } from "../../../config/game";
import { useRouter } from "next/navigation";
import { useChessGame } from "../../../hooks/useChessGame";
import { useGameTimer } from "../../../hooks/useGameTimer";
import { useGameDialogs } from "../../../hooks/useGameDialogs";
import { useMoveHandler } from "../../../hooks/useMoveHandler";
import { Bot, BOTS_BY_DIFFICULTY } from "@/components/game/data/bots";
import GameDialogs from "../dialogs/GameDialogs";
import GameControls from "@/components/game/controls/GameControls";
import SquareComponent from "@/components/game/board/Square";
import Piece from "@/components/game/board/Piece";
import VictoryModal from "../modal/VictoryModal";
import PlayerProfile from "./PlayerProfile";
import BotSelectionPanel from "@/components/game/controls/BotSelectionPanel";

const ChessBoard = ({ difficulty }: { difficulty: string }) => {
  const [shouldPulse, setShouldPulse] = useState(false);
  const [selectedBot, setSelectedBot] = useState<Bot | null>(() => {
    const savedBot = localStorage.getItem("selectedBot");
    // If there's a saved bot, use it, otherwise use the first bot from the difficulty category
    return savedBot ? JSON.parse(savedBot) : BOTS_BY_DIFFICULTY[difficulty][0];
  });
  const [showBotSelection, setShowBotSelection] = useState(true);

  const router = useRouter();

  // Hooks ----------------------------------------------------
  const {
    game,
    board,
    setBoard,
    history,
    setHistory,
    currentMove,
    setCurrentMove,
    lastMove,
    setLastMove,
    gameStarted,
    setGameStarted,
    makeMove,
    moveBack,
    moveForward,
    playerColor,
    setPlayerColor,
  } = useChessGame(difficulty);

  const { getBotMove } = useStockfish(game, selectedBot, makeMove);

  // Load saved state for piece set
  const [pieceSet, setPieceSet] = useState<string>(() => {
    const savedState = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    return savedState?.pieceSet || "staunty";
  });

  // Load saved state for game timer
  const savedState = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  const { gameTime, whiteTime, blackTime, resetTimers } = useGameTimer(
    game,
    gameStarted,
    savedState
      ? {
          gameTime: savedState.gameTime,
          whiteTime: savedState.whiteTime,
          blackTime: savedState.blackTime,
        }
      : undefined
  );

  const {
    showDifficultyDialog,
    showColorDialog,
    pendingDifficulty,
    pendingColor,
    setPendingDifficulty,
    setPendingColor,
    handleResign,
    handleDifficultyDialogOpen,
    handleColorDialogOpen,
    handleRestart: handleModalClose,
    setShowDifficultyDialog,
    setShowColorDialog,
    showVictoryModal,
    isResignationModal,
    handleCancelDialog,
    handleConfirmResign,
    setShowVictoryModal,
    setIsResignationModal,
    showNewBotDialog,
    setShowNewBotDialog,
    handleNewBotDialog,
  } = useGameDialogs();

  const {
    selectedPiece,
    setSelectedPiece,
    possibleMoves,
    setPossibleMoves,
    handleSquareClick,
  } = useMoveHandler(
    game,
    board,
    setBoard,
    playerColor,
    makeMove,
    setHistory,
    setCurrentMove,
    setLastMove,
    setGameStarted,
    getBotMove,
    setShowBotSelection,
    showBotSelection
  );
  // -----------------------------------------------------------

  // Save state
  useEffect(() => {
    const gameState = {
      fen: game.fen(),
      playerColor,
      gameTime,
      whiteTime,
      blackTime,
      difficulty,
      gameStarted,
      history,
      currentMove,
      lastMove,
      pieceSet,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  }, [
    game,
    playerColor,
    gameTime,
    whiteTime,
    blackTime,
    difficulty,
    gameStarted,
    history,
    currentMove,
    lastMove,
    pieceSet,
  ]);

  useEffect(() => {
    if (selectedBot) {
      localStorage.setItem("selectedBot", JSON.stringify(selectedBot));
    } else {
      localStorage.removeItem("selectedBot");
    }
  }, [selectedBot]);

  const handleSelectBot = (bot: Bot) => {
    setSelectedBot(bot);
    setShowBotSelection(false);
  };

  const handleDifficultyChange = (newDifficulty: string) => {
    if (gameStarted) {
      handleDifficultyDialogOpen(newDifficulty);
    } else {
      handleGameReset();
      router.push(`/play/${newDifficulty.toLowerCase()}`);
    }
  };

  const handleConfirmDifficultyChange = () => {
    if (pendingDifficulty) {
      localStorage.removeItem("chess-game-state");
      router.push(`/play/${pendingDifficulty.toLowerCase()}`);
    }
    setShowDifficultyDialog(false);
    setPendingDifficulty(null);
    setGameStarted(false); // Reset game started state
  };

  // Pulse border when showing bot selection
  useEffect(() => {
    if (showBotSelection) {
      setShouldPulse(true);
      const timer = setTimeout(() => setShouldPulse(false), 6000);
      return () => clearTimeout(timer);
    }
  }, [showBotSelection]);

  // Clear lastMove when opponent's turn starts
  useEffect(() => {
    if (game.turn() !== playerColor && lastMove?.from !== undefined) {
      // Only clear if it's opponent's turn AND there's a lastMove to clear
      const isOpponentMove = lastMove.from.includes(game.turn());
      if (isOpponentMove) {
        console.log("Clearing lastMove because opponent's turn");
        setLastMove(null);
      }
    }
  }, [game.turn(), playerColor, lastMove, game, setLastMove]);

  // Game status display
  const getGameStatus = () => {
    if (game.isCheckmate())
      return `Checkmate! ${game.turn() === "w" ? "Black" : "White"} wins!`;
    if (game.isDraw()) return "Game is a draw!";
    if (game.isCheck())
      return `${game.turn() === "w" ? "White" : "Black"} is in check!`;
    return `${game.turn() === "w" ? "White" : "Black"} turn to move`;
  };

  const handleRematch = () => {
    handleModalClose();
    setTimeout(handleGameReset, 0);
  };

  // Game restart
  const handleGameReset = () => {
    game.reset();
    setBoard(game.board());
    setSelectedPiece(null);
    setPossibleMoves([]);
    resetTimers();
    setGameStarted(false);
    setHistory([{ fen: DEFAULT_STATE.fen, lastMove: null }]);
    setCurrentMove(1);
    setLastMove(null);

    // Save state with preserved player color
    const currentState = {
      ...DEFAULT_STATE,
      playerColor,
      difficulty,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));

    if (playerColor === "b") {
      setTimeout(getBotMove, 500);
    }
  };

  const handleColorChange = (color: "w" | "b") => {
    if (gameStarted) {
      handleColorDialogOpen(color);
      setShowColorDialog(true);
    } else {
      // If no game in progress, change color directly
      setPlayerColor(color);
      game.reset();
      setBoard(game.board());
      setSelectedPiece(null);
      setPossibleMoves([]);
      resetTimers();
      setGameStarted(false);

      // Save the new state with updated color
      const newState = {
        ...DEFAULT_STATE,
        playerColor: color,
        difficulty,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));

      if (color === "b") {
        setTimeout(getBotMove, 500);
      }
    }
  };

  const handleConfirmColorChange = () => {
    if (pendingColor) {
      setPlayerColor(pendingColor);
      game.reset();
      setBoard(game.board());
      setSelectedPiece(null);
      setPossibleMoves([]);
      resetTimers();
      setGameStarted(false);

      // Save the new state with updated color
      const newState = {
        ...DEFAULT_STATE,
        playerColor: pendingColor,
        difficulty,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));

      if (pendingColor === "b") {
        setTimeout(getBotMove, 500);
      }
    }
    setShowColorDialog(false);
    setPendingColor(null);
  };

  // Add useEffect to show modal on game over
  useEffect(() => {
    if (game.isGameOver() && gameStarted) {
      setShowVictoryModal(true);
      setIsResignationModal(false);
    }
  }, [
    game.isGameOver(),
    gameStarted,
    setShowVictoryModal,
    setIsResignationModal,
  ]);

  const handleNewBot = () => {
    handleModalClose();
    setTimeout(() => {
      handleGameReset();
      setShowBotSelection(true); // Show bot selection again
      // highlight the difficulty section
      const difficultySection = document.querySelector(
        "[data-highlight-difficulty]"
      );
      difficultySection?.classList.add("highlight-difficulty");
      setTimeout(() => {
        difficultySection?.classList.remove("highlight-difficulty");
      }, 8000);
    }, 0);
  };

  const confirmNewBot = () => {
    // Remove selected bot from localStorage
    localStorage.removeItem("selectedBot");

    // Reset game and show bot selection
    handleModalClose();
    setSelectedBot(null);
    setShowBotSelection(true);
    handleGameReset();

    // Close dialog if it was open
    setShowNewBotDialog(false);
  };

  /* Bot Selection Panel */
  <BotSelectionPanel
    bots={BOTS_BY_DIFFICULTY[difficulty]}
    onSelectBot={handleSelectBot}
    difficulty={difficulty}
    onDifficultyChange={handleDifficultyChange}
    selectedBot={selectedBot}
  />;

  return (
    <>
      <main className="flex flex-col w-full items-center justify-center gap-4 p-2 min-h-[calc(90vh-4rem)]">
        <div className="flex flex-col lg:flex-row w-full items-center lg:items-start justify-center gap-4">
          <div className="relative w-full max-w-[min(90vh,90vw)] lg:max-w-[105vh]">
            {/* Chess board and profiles */}
            <div className="flex mb-4 lg:hidden">
              <PlayerProfile
                difficulty={difficulty}
                isBot={true}
                selectedBot={selectedBot}
              />
            </div>

            <div className="relative w-full aspect-square">
              {/* Show overlay when no bot is selected OR when bot selection is showing */}
              {(!selectedBot || showBotSelection) && (
                <div className="absolute  z-10 rounded-lg flex items-center justify-center">
                  <span className="text-white text-4xl">
                    {/* <CardTitle>Select a Bot to Play</CardTitle> */}
                  </span>
                </div>
              )}
              <div className="flex flex-col lg:flex-row w-full items-center lg:items-start justify-center gap-4">
                <div className="hidden lg:flex flex-col justify-between self-stretch">
                  <PlayerProfile
                    difficulty={difficulty}
                    isBot={true}
                    selectedBot={selectedBot}
                  />
                  <div className="mt-4">
                    <PlayerProfile
                      difficulty={difficulty}
                      isBot={false}
                      selectedBot={selectedBot}
                    />
                  </div>
                </div>
                <div className="relative w-full max-w-[min(90vh,90vw)] lg:max-w-[105vh]">
                  <div className="w-full aspect-square">
                    <div className="w-full h-full grid grid-cols-8 border border-border rounded-lg overflow-hidden">
                      {board.map((row, rowIndex) =>
                        row.map((_, colIndex) => {
                          const actualRowIndex =
                            playerColor === "w" ? rowIndex : 7 - rowIndex;
                          const actualColIndex =
                            playerColor === "w" ? colIndex : 7 - colIndex;
                          const piece = board[actualRowIndex][actualColIndex];
                          const square = `${"abcdefgh"[actualColIndex]}${
                            8 - actualRowIndex
                          }`;
                          const isKingInCheck =
                            game.isCheck() &&
                            piece?.type.toLowerCase() === "k" &&
                            piece?.color === game.turn();
                          const isLastMove =
                            lastMove &&
                            (square === lastMove.from ||
                              square === lastMove.to);
                          const showRank =
                            playerColor === "w"
                              ? colIndex === 0
                              : colIndex === 7;
                          const showFile =
                            playerColor === "w"
                              ? rowIndex === 7
                              : rowIndex === 0;
                          const coordinate = showRank
                            ? `${8 - actualRowIndex}`
                            : showFile
                            ? `${"abcdefgh"[actualColIndex]}`
                            : "";

                          return (
                            <SquareComponent
                              key={`${rowIndex}-${colIndex}`}
                              isLight={
                                (actualRowIndex + actualColIndex) % 2 === 0
                              }
                              isSelected={
                                selectedPiece?.row === actualRowIndex &&
                                selectedPiece?.col === actualColIndex
                              }
                              isPossibleMove={possibleMoves.includes(square)}
                              onClick={() =>
                                handleSquareClick(
                                  actualRowIndex,
                                  actualColIndex
                                )
                              }
                              difficulty={difficulty}
                              isCheck={isKingInCheck}
                              isLastMove={isLastMove ?? false}
                              showRank={showRank}
                              showFile={showFile}
                              coordinate={coordinate}
                            >
                              {piece && (
                                <Piece
                                  type={
                                    piece.color === "w"
                                      ? piece.type.toUpperCase()
                                      : piece.type.toLowerCase()
                                  }
                                  pieceSet={pieceSet}
                                />
                              )}
                            </SquareComponent>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex mt-4 lg:hidden">
              <PlayerProfile difficulty={difficulty} isBot={false} />
            </div>
          </div>

          {/* Game Controls on the right */}
          <div className="w-full lg:w-80 lg:flex flex-col  justify-between">
            {showBotSelection ? (
              <div className={shouldPulse ? "pulse-border" : ""}>
                <BotSelectionPanel
                  bots={BOTS_BY_DIFFICULTY[difficulty]}
                  onSelectBot={handleSelectBot}
                  difficulty={difficulty}
                  onDifficultyChange={handleDifficultyChange}
                  selectedBot={selectedBot}
                />
              </div>
            ) : (
              <div>
                <GameControls
                  difficulty={difficulty}
                  gameStatus={getGameStatus()}
                  onResign={handleResign}
                  onColorChange={handleColorChange}
                  onDifficultyChange={handleDifficultyChange}
                  playerColor={playerColor}
                  gameTime={gameTime}
                  whiteTime={whiteTime}
                  blackTime={blackTime}
                  game={game}
                  onMoveBack={moveBack}
                  onMoveForward={moveForward}
                  canMoveBack={currentMove > 1}
                  canMoveForward={currentMove < history.length}
                  onRematch={handleGameReset}
                  history={history}
                  pieceSet={pieceSet}
                  onPieceSetChange={setPieceSet}
                  onNewBot={handleNewBot}
                  handleNewBotDialog={handleNewBotDialog}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      <VictoryModal
        isOpen={showVictoryModal}
        onClose={handleCancelDialog}
        onRematch={handleRematch}
        onNewBot={handleNewBot}
        game={game}
        difficulty={difficulty}
        isResignation={isResignationModal}
        onConfirmResign={handleConfirmResign}
        playerColor={playerColor}
        handleNewBotDialog={handleNewBotDialog}
        selectedBot={selectedBot}
        playerName="Player"
      />

      <GameDialogs
        showDifficultyDialog={showDifficultyDialog}
        showColorDialog={showColorDialog}
        showNewBotDialog={showNewBotDialog}
        onConfirmDifficultyChange={handleConfirmDifficultyChange}
        onConfirmColorChange={handleConfirmColorChange}
        onConfirmNewBot={confirmNewBot}
        onCancelDialog={handleCancelDialog}
      />
    </>
  );
};

export default ChessBoard;
