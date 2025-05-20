"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useStockfish } from "../../../hooks/useStockfish";
import { STORAGE_KEY, DEFAULT_STATE } from "../../../config/game";
import { useRouter } from "next/navigation";
import { useChessGame } from "../../../hooks/useChessGame";
import { useGameTimer } from "../../../hooks/useGameTimer";
import { useGameDialogs } from "../../../hooks/useGameDialogs";
import { useMoveHandler } from "../../../hooks/useMoveHandler";
import { Bot, BOTS_BY_DIFFICULTY } from "@/components/game/data/bots";
import { useGameSounds } from "@/hooks/useGameSounds";
import { useHintEngine } from "@/hooks/useHintEngine";
import useHighlightedSquares from "./HighlightedSquares";
import GameDialogs from "../dialogs/GameDialogs";
import GameControls from "@/components/game/controls/GameControls";
import VictoryModal from "../modal/VictoryModal";
import PlayerProfile from "./PlayerProfile";
import BotSelectionPanel from "@/components/game/controls/BotSelectionPanel";
import PawnPromotionModal from "./PawnPromotionModal";
import PreMadeMove from "./PreMadeMove";
import { useAuth } from "@/context/auth-context";
import DraggablePiece from "./DraggablePiece";
import DroppableSquare from "./DroppableSquare";
import { Chess } from "chess.js";
import ChessboardArrows, { Arrow } from "./ChessboardArrows";
import { LockKeyhole } from "lucide-react";
import {
  getAutoQueen,
  getMoveInputMethod,
  getBoardTheme,
} from "@/lib/settings";
import AnimatedPiece from "./AnimatedPiece";

const GAME_OVER_MODAL_SHOWN_KEY = "chess_gameOverModalShown";
const GAME_OVER_FEN_KEY = "chess_gameOverFen";

interface ChessBoardProps {
  difficulty: string;
  initialBot?: (Bot & { difficulty: string }) | null;
}

const ChessBoard = ({ difficulty, initialBot }: ChessBoardProps) => {
  const [shouldPulse, setShouldPulse] = useState(false);
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null);
  const [showBotSelection, setShowBotSelection] = useState(true);
  const [isAwaitingPlay, setIsAwaitingPlay] = useState(true); // NEW: Awaiting Play state
  const [hintMove, setHintMove] = useState<{ from: string; to: string } | null>(
    null
  );

  const [whitePiecesBottom, setWhitePiecesBottom] = useState(true);
  const [isPreMadeMove, setIsPreMadeMove] = useState<
    (square: string) => boolean
  >(() => () => false);
  const [preMadeMoveHandler, setPreMadeMoveHandler] = useState<
    (row: number, col: number) => boolean
  >(() => () => false);
  const [isPreMadePossibleMove, setIsPreMadePossibleMove] = useState<
    (square: string) => boolean
  >(() => () => false);

  const { handleRightClick, handleLeftClick, clearHighlights, isHighlighted } =
    useHighlightedSquares();

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
    capturedPieces,
    resetCapturedPieces,
    pendingPromotion,
    setPendingPromotion,
    setCapturedPieces,
  } = useChessGame(difficulty);

  const { getBotMove } = useStockfish(game, selectedBot, makeMove);
  const { getHint, isCalculating } = useHintEngine();

  // Load user settings from session or localStorage
  const { status, session } = useAuth();
  const [pieceSet, setPieceSet] = useState("staunty");
  const [showCoordinates, setShowCoordinates] = useState(true);
  const [autoQueen, setAutoQueen] = useState(() => getAutoQueen());
  const [moveInputMethod, setMoveInputMethod] = useState<
    "click" | "drag" | "both"
  >(() => getMoveInputMethod());
  const [boardTheme, setBoardTheme] = useState<string>(() => getBoardTheme());

  // Initialize game timer
  const { gameTime, whiteTime, blackTime, resetTimers } = useGameTimer(
    game,
    gameStarted,
    undefined
  );

  // Add state for player name
  const [playerName, setPlayerName] = useState("Player");

  // Load player name from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPlayerName = localStorage.getItem("chess-player-name");
      if (savedPlayerName) {
        setPlayerName(savedPlayerName);
      }
    }
  }, []);

  // Load user settings from session or localStorage
  useEffect(() => {
    let loadedFromSession = false;
    if (status === "authenticated" && session?.user) {
      const user = session.user;
      // Load settings from session, provide fallbacks
      setPieceSet(user.pieceSet || "staunty");
      setShowCoordinates(user.showCoordinates !== false);
      setWhitePiecesBottom(user.whitePiecesBottom !== false);
      setAutoQueen(
        "autoQueen" in user && typeof user.autoQueen === "boolean"
          ? user.autoQueen
          : getAutoQueen()
      );
      setMoveInputMethod(
        "moveInputMethod" in user &&
          (user.moveInputMethod === "click" ||
            user.moveInputMethod === "drag" ||
            user.moveInputMethod === "both")
          ? user.moveInputMethod
          : getMoveInputMethod()
      );
      setBoardTheme(
        "boardTheme" in user && typeof user.boardTheme === "string"
          ? user.boardTheme
          : getBoardTheme()
      );
      loadedFromSession = true;
    }

    // Fallback to localStorage if not loaded from session or not authenticated
    if (!loadedFromSession && typeof window !== "undefined") {
      const savedPieceSet = localStorage.getItem("chess_piece_set");
      const savedShowCoordinates = localStorage.getItem(
        "chess_show_coordinates"
      );
      const savedWhitePiecesBottom = localStorage.getItem(
        "chess_white_pieces_bottom"
      );

      if (savedPieceSet) setPieceSet(savedPieceSet);
      if (savedShowCoordinates !== null) {
        setShowCoordinates(savedShowCoordinates !== "false");
      }
      if (savedWhitePiecesBottom !== null) {
        setWhitePiecesBottom(savedWhitePiecesBottom !== "false");
      }
    }
    // Depend on session user object and status
  }, [status, session?.user]);

  const hasInitialized = useRef(false);

  // Mount-only initialization for game state
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const savedStateJSON = localStorage.getItem(STORAGE_KEY);
    const gameOverModalWasShownPreviously =
      localStorage.getItem(GAME_OVER_MODAL_SHOWN_KEY) === "true";
    const lastKnownGameOverFen = localStorage.getItem(GAME_OVER_FEN_KEY);

    let isActiveGame = false;
    if (savedStateJSON) {
      const savedState = JSON.parse(savedStateJSON);
      let gameStillOverAfterLoad = false;
      let currentFenForCheck = "";

      if (savedState.fen) {
        currentFenForCheck = savedState.fen;
        const tempGame = new Chess(savedState.fen);
        if (tempGame.isGameOver() || savedState.isResigned === true) {
          gameStillOverAfterLoad = true;
        }
      }

      isActiveGame =
        savedState.fen &&
        (savedState.fen !== DEFAULT_STATE.fen ||
          (savedState.history && savedState.history.length > 1) ||
          savedState.lastMove !== null);

      if (
        gameStillOverAfterLoad &&
        gameOverModalWasShownPreviously &&
        currentFenForCheck === lastKnownGameOverFen
      ) {
        handleGameReset(false);
        setShowBotSelection(true);
        if (savedState.playerColor) setPlayerColor(savedState.playerColor);
        if (playerColor === "b" && savedState.playerColor === "b") {
          game.load("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1");
          setBoard(game.board());
        }
        return;
      } else if (isActiveGame) {
        // Load active game state
        if (savedState.fen) {
          game.load(savedState.fen);
          if (savedState.isResigned === true) game.isResigned = true;
          setBoard(game.board());
        }
        if (savedState.playerColor) setPlayerColor(savedState.playerColor);
        if (savedState.history) setHistory(savedState.history);
        if (savedState.currentMove) setCurrentMove(savedState.currentMove);
        if (savedState.lastMove) setLastMove(savedState.lastMove);
        if (savedState.pieceSet) setPieceSet(savedState.pieceSet);
        if (savedState.capturedPieces)
          setCapturedPieces(savedState.capturedPieces);

        setGameStarted(true);
        setShowBotSelection(false);

        // Try to load selectedBot if an active game is resumed
        const savedBotJson = localStorage.getItem("selectedBot");
        if (savedBotJson) {
          try {
            const parsedBot = JSON.parse(savedBotJson);
            if (parsedBot && parsedBot.id && parsedBot.name) {
              setSelectedBot(parsedBot);
            } else {
              const currentDifficultyBots =
                BOTS_BY_DIFFICULTY[difficulty] || [];
              if (currentDifficultyBots.length > 0) {
                setSelectedBot(currentDifficultyBots[0]);
              }
            }
          } catch {
            const currentDifficultyBots = BOTS_BY_DIFFICULTY[difficulty] || [];
            if (currentDifficultyBots.length > 0) {
              setSelectedBot(currentDifficultyBots[0]);
            }
          }
        } else if (BOTS_BY_DIFFICULTY[difficulty]?.length > 0) {
          setSelectedBot(BOTS_BY_DIFFICULTY[difficulty][0]);
        }
      } else {
        // Not an active game, or FEN is default with no history - treat as new game setup
        if (!initialBot) {
          setShowBotSelection(true);
          setGameStarted(false);
          if (playerColor === "b") {
            game.load(
              "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1"
            );
            setBoard(game.board());
          }
        }
      }
    } else {
      if (!initialBot) {
        setShowBotSelection(true);
        setGameStarted(false);
        if (playerColor === "b") {
          game.load("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1");
          setBoard(game.board());
        }
      }
    }

    if (!initialBot && !isActiveGame) {
      const savedBotJson = localStorage.getItem("selectedBot");
      if (savedBotJson) {
        try {
          const parsedBot = JSON.parse(savedBotJson);
          if (parsedBot && parsedBot.id && parsedBot.name) {
            const currentDifficultyBots = BOTS_BY_DIFFICULTY[difficulty] || [];
            const isFromCurrentDifficulty = currentDifficultyBots.some(
              (bot: Bot) => bot.id === parsedBot.id
            );
            setSelectedBot(
              isFromCurrentDifficulty
                ? parsedBot
                : currentDifficultyBots.length > 0
                  ? currentDifficultyBots[0]
                  : null
            );
          } else {
            const currentDifficultyBots = BOTS_BY_DIFFICULTY[difficulty] || [];
            if (currentDifficultyBots.length > 0) {
              setSelectedBot(currentDifficultyBots[0]);
            }
          }
        } catch {
          const currentDifficultyBots = BOTS_BY_DIFFICULTY[difficulty] || [];
          if (currentDifficultyBots.length > 0) {
            setSelectedBot(currentDifficultyBots[0]);
          }
        }
      } else {
        const currentDifficultyBots = BOTS_BY_DIFFICULTY[difficulty] || [];
        if (currentDifficultyBots.length > 0) {
          setSelectedBot(currentDifficultyBots[0]);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

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
    handleCancelDialog,
    handleConfirmResign,
    setShowVictoryModal,
    showNewBotDialog,
    setShowNewBotDialog,
    handleNewBotDialog,
    isResignationModal,
  } = useGameDialogs();

  const {
    selectedPiece,
    setSelectedPiece,
    possibleMoves,
    setPossibleMoves,
    handleSquareClick: originalHandleSquareClick,
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
    showBotSelection,
    autoQueen
  );

  const { playSound } = useGameSounds();
  // -----------------------------------------------------------

  // Add sound to game start
  useEffect(() => {
    if (gameStarted && !showBotSelection) {
      playSound("game-start");
    }
  }, [gameStarted, showBotSelection, playSound]);

  // Pre-compute complex expressions for dependency array
  const currentFen = game.fen();
  const currentIsResigned = game.isResigned === true;

  // Save state
  useEffect(() => {
    if (typeof window !== "undefined" && gameStarted) {
      const hasMovesBeenMade =
        lastMove !== null || (history && history.length > 1);

      if (hasMovesBeenMade) {
        const gameState = {
          fen: currentFen,
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
          capturedPieces,
          isResigned: currentIsResigned,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
      }
    }
  }, [
    game,
    currentMove,
    difficulty,
    gameStarted,
    history,
    lastMove,
    pieceSet,
    playerColor,
    gameTime,
    whiteTime,
    blackTime,
    capturedPieces,
    currentFen,
    currentIsResigned,
  ]);

  // Save state when component unmounts
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") {
        if (gameStarted) {
          const hasMovesBeenMade =
            lastMove !== null || (history && history.length > 1);

          if (hasMovesBeenMade) {
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
              capturedPieces,
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
          } else {
            // If no moves made, remove any saved state
            localStorage.removeItem(STORAGE_KEY);
          }
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    };
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
    capturedPieces,
  ]);

  useEffect(() => {
    if (typeof window !== "undefined" && selectedBot) {
      localStorage.setItem("selectedBot", JSON.stringify(selectedBot));
    }
  }, [selectedBot]);

  // Clear hint move when a move is made
  useEffect(() => {
    setHintMove(null);
  }, [lastMove]);

  // Clear highlights when a move is made
  useEffect(() => {
    if (lastMove) {
      clearHighlights();
    }
  }, [lastMove, clearHighlights]);

  const handleSelectBot = (bot: Bot | (Bot & { difficulty: string })) => {
    const botWithoutDifficulty: Bot = {
      id: bot.id,
      name: bot.name,
      image: bot.image,
      rating: bot.rating,
      description: bot.description,
      skillLevel: bot.skillLevel,
      depth: bot.depth,
      moveTime: bot.moveTime,
      flag: bot.flag,
    };

    setSelectedBot(botWithoutDifficulty);
  };

  const handleDifficultyChange = (newDifficulty: string) => {
    if (gameStarted) {
      handleDifficultyDialogOpen(newDifficulty);
    } else {
      localStorage.removeItem("selectedBot");
      handleGameReset(false);
      setIsPreMadeMove(() => () => false);
      setPreMadeMoveHandler(() => () => false);
      setIsPreMadePossibleMove(() => () => false);
      router.push(`/play/${newDifficulty.toLowerCase()}`);
    }
  };

  const handleConfirmDifficultyChange = () => {
    if (pendingDifficulty) {
      localStorage.removeItem("chess-game-state");
      localStorage.removeItem("selectedBot");
      setIsPreMadeMove(() => () => false);
      setPreMadeMoveHandler(() => () => false);
      setIsPreMadePossibleMove(() => () => false);
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

  const handleRematch = () => {
    handleModalClose();
    setTimeout(() => handleGameReset(true), 0);
  };

  // Game restart
  const handleGameReset = (setStarted = true) => {
    game.reset();
    game.isResigned = false;

    // If player is black, set up the board for black to move first
    if (playerColor === "b") {
      game.load("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1");
    }

    setBoard(game.board());
    setSelectedPiece(null);
    setPossibleMoves([]);
    resetTimers();
    setGameStarted(setStarted);
    setHistory([{ fen: game.fen(), lastMove: null }]);
    setCurrentMove(1);
    setLastMove(null);
    resetCapturedPieces();
    setHintMove(null);
    setIsPreMadeMove(() => () => false);
    setPreMadeMoveHandler(() => () => false);
    setIsPreMadePossibleMove(() => () => false);

    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(GAME_OVER_MODAL_SHOWN_KEY);
    localStorage.removeItem(GAME_OVER_FEN_KEY);

    // Save state with preserved player color
    const currentState = {
      ...DEFAULT_STATE,
      playerColor,
      difficulty,
      lastMove: null,
      gameStarted: setStarted, // Use the parameter value
      fen: game.fen(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));
  };

  const handleColorChange = (color: "w" | "b") => {
    if (gameStarted && !isAwaitingPlay) {
      handleColorDialogOpen(color);
      setShowColorDialog(true);
    } else {
      setPlayerColor(color);
      game.reset();
      if (color === "b") {
        game.load("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1");
      }
      setBoard(game.board());
      setSelectedPiece(null);
      setPossibleMoves([]);
      resetTimers();
      setGameStarted(false);
      setIsAwaitingPlay(true);
      resetCapturedPieces();
      setLastMove(null);
      setHintMove(null);
      setIsPreMadeMove(() => () => false);
      setPreMadeMoveHandler(() => () => false);
      setIsPreMadePossibleMove(() => () => false);
      // Save the new state with updated color
      const newState = {
        ...DEFAULT_STATE,
        playerColor: color,
        difficulty,
        lastMove: null,
        fen: game.fen(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    }
  };

  const handleConfirmColorChange = () => {
    if (pendingColor) {
      setPlayerColor(pendingColor);
      game.reset();

      if (pendingColor === "b") {
        game.load("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1");
      }

      setBoard(game.board());
      setSelectedPiece(null);
      setPossibleMoves([]);
      resetTimers();
      setGameStarted(false);
      resetCapturedPieces();
      setLastMove(null);
      setHintMove(null);
      setIsPreMadeMove(() => () => false);
      setPreMadeMoveHandler(() => () => false);
      setIsPreMadePossibleMove(() => () => false);

      // Save the new state with updated color
      const newState = {
        ...DEFAULT_STATE,
        playerColor: pendingColor,
        difficulty,
        lastMove: null,
        fen: game.fen(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    }
    setShowColorDialog(false);
    setPendingColor(null);
  };

  // Compute game status for effects
  const isGameOverCurrent = game.isGameOver() || game.isResigned === true;

  // Add useEffect to show modal on game over and set localStorage flags
  useEffect(() => {
    // Condition for showing modal: game is over, game has started, and it's not an active resignation confirmation step.
    if (isGameOverCurrent && gameStarted && !isResignationModal) {
      const currentFen = game.fen();
      const modalAlreadyProcessedForThisFen =
        localStorage.getItem(GAME_OVER_MODAL_SHOWN_KEY) === "true" &&
        localStorage.getItem(GAME_OVER_FEN_KEY) === currentFen;

      if (!modalAlreadyProcessedForThisFen) {
        setShowVictoryModal(true); // Show the modal
        localStorage.setItem(GAME_OVER_MODAL_SHOWN_KEY, "true");
        localStorage.setItem(GAME_OVER_FEN_KEY, currentFen);
        playSound("game-end");
      }
    }
  }, [
    isGameOverCurrent,
    gameStarted,
    isResignationModal,
    game,
    setShowVictoryModal,
    playSound,
  ]);

  const handleNewBot = () => {
    handleModalClose();
    setTimeout(() => {
      handleGameReset(false);
      setShowBotSelection(true); // Show bot selection again
      setIsAwaitingPlay(true);
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
    // Select the first bot from the current difficulty
    setSelectedBot(BOTS_BY_DIFFICULTY[difficulty][0]);
    setShowBotSelection(true);
    handleGameReset(false);
    setIsAwaitingPlay(true);

    // Close dialog if it was open
    setShowNewBotDialog(false);
  };

  const handleHintRequest = () => {
    if (game.turn() === playerColor && !game.isGameOver()) {
      getHint(game, (from, to, promotion) => {
        setHintMove({ from, to });
        if (promotion) {
        }
      });
    }
  };

  const handlePreMadeMoveChange = useCallback(
    (handler: (square: string) => boolean) => {
      setIsPreMadeMove(() => handler);
    },
    []
  );

  const handlePreMadeMoveSquareClick = useCallback(
    (handler: (row: number, col: number) => boolean) => {
      setPreMadeMoveHandler(() => handler);
    },
    []
  );

  const handlePreMadePossibleMovesChange = useCallback(
    (handler: (square: string) => boolean) => {
      setIsPreMadePossibleMove(() => handler);
    },
    []
  );

  const handleSquareClick = (row: number, col: number) => {
    // First try to handle as a pre-made move if it's not the player's turn
    if (game.turn() !== playerColor) {
      try {
        const handled = preMadeMoveHandler(row, col);
        if (handled) {
          // If the pre-made move was handled, don't proceed with normal move handling
          return;
        }
      } catch {
        console.error("Error handling pre-made move");
      }
    }

    handleLeftClick(); // Clear highlights on left click
    originalHandleSquareClick(row, col);
  };

  // Handle drag start - similar to clicking on a piece
  const handleDragStart = (position: string) => {
    // When drag starts, simulate the same behavior as clicking on a piece
    const [file, rank] = position.split("");
    const colIndex = "abcdefgh".indexOf(file);
    const rowIndex = 8 - parseInt(rank);

    // Clear any existing highlights
    handleLeftClick();

    // Select the piece and show possible moves
    originalHandleSquareClick(rowIndex, colIndex);
  };

  // Handle pawn promotion piece selection
  const handlePromotionSelect = (pieceType: "q" | "r" | "n" | "b") => {
    if (pendingPromotion) {
      const { from, to } = pendingPromotion;
      const moveSuccessful = makeMove(from, to, pieceType);

      if (moveSuccessful) {
        const gameState = {
          fen: game.fen(),
          playerColor,
          gameTime,
          whiteTime,
          blackTime,
          difficulty,
          gameStarted: true,
          history,
          currentMove,
          lastMove,
          pieceSet,
          capturedPieces,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));

        // If it's the bot's turn and the game is not over, trigger the bot move
        if (game.turn() !== playerColor && !game.isGameOver()) {
          setTimeout(getBotMove, 1000);
        }
      }
    }
  };

  // Cancel pawn promotion
  const handlePromotionCancel = () => {
    setPendingPromotion(null);
  };

  // Add a specific effect to handle navigation back to the game
  useEffect(() => {
    // This effect runs when the component mounts (including when navigating back to the game)
    const savedState = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");

    // If there's a valid saved game state with a non-default FEN, ensure we show the game controls
    if (
      savedState?.fen &&
      (savedState.fen !== DEFAULT_STATE.fen || savedState.playerColor === "b")
    ) {
      // This is a saved game, so make sure we show the game controls
      setShowBotSelection(false);

      const hasMovesBeenMade =
        savedState.lastMove !== null ||
        (savedState.history && savedState.history.length > 1);

      if (hasMovesBeenMade) {
        setGameStarted(true);

        // Also ensure the gameStarted flag is set in localStorage
        if (!savedState.gameStarted) {
          savedState.gameStarted = true;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(savedState));
        }

        if (savedState.fen) {
          game.load(savedState.fen);
          setBoard(game.board());
        }
      } else {
        setGameStarted(false);
        localStorage.removeItem(STORAGE_KEY);

        if (savedState.playerColor === "b") {
          game.load("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1");
          setBoard(game.board());
          setPlayerColor("b");
        }
      }
    }
  }, [game, setBoard, setGameStarted, setPlayerColor]);

  const handleDragMove = (
    item: { type: string; position: string },
    targetPosition: string
  ) => {
    if (game.turn() !== playerColor) return;
    if (game.isGameOver() || game.isResigned) return;

    // Convert the positions to the format that makeMove expects
    const fromPosition = item.position;
    const toPosition = targetPosition;

    if (fromPosition === toPosition) return;

    // Call makeMove with the from and to positions
    const moveSuccessful = makeMove(fromPosition, toPosition);

    if (moveSuccessful) {
      // Clear possible moves and selected piece after successful move
      setPossibleMoves([]);
      setSelectedPiece(null);

      // Hide bot selection panel when first move is made
      if (showBotSelection) {
        setShowBotSelection(false);
      }

      setBoard(game.board());

      if (!game.isGameOver()) {
        setTimeout(getBotMove, 1000);
      }

      if (!game.isGameOver()) {
        setGameStarted(true);
        // Ensure the game state is saved with gameStarted=true
        const STORAGE_KEY = "chess-game-state";
        const currentState = JSON.parse(
          localStorage.getItem(STORAGE_KEY) || "{}"
        );
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            ...currentState,
            gameStarted: true,
          })
        );
      }
    }
  };

  // * ========================================================================
  // *                              ARROW DRAWING STATE
  // * ========================================================================
  const [arrows, setArrows] = useState<Arrow[]>([]);
  const [drawingArrow, setDrawingArrow] = useState<string | null>(null);
  const rightDragJustFinishedRef = useRef<boolean>(false);

  // * Board size calculation for SVG overlay
  const BOARD_SIZE = 560; // px, fallback default
  const boardGridRef = useRef<HTMLDivElement>(null);
  const [boardSize, setBoardSize] = useState<number>(BOARD_SIZE);

  useEffect(() => {
    // Responsive board size
    const updateBoardSize = () => {
      if (boardGridRef.current) {
        setBoardSize(boardGridRef.current.offsetWidth);
      }
    };
    updateBoardSize();
    window.addEventListener("resize", updateBoardSize);
    return () => window.removeEventListener("resize", updateBoardSize);
  }, []);

  // * Handle right mouse down on a square to start drawing an arrow
  const handleSquareMouseDown = (square: string, event: React.MouseEvent) => {
    if (event.button === 2) {
      setDrawingArrow(square);
      rightDragJustFinishedRef.current = false;
    }
  };

  // * Handle right mouse up on a square to finish drawing an arrow
  const handleSquareMouseUp = (square: string, event: React.MouseEvent) => {
    if (event.button === 2) {
      const arrowDragStartSquare = drawingArrow;
      setDrawingArrow(null);

      if (arrowDragStartSquare && arrowDragStartSquare !== square) {
        setArrows((prev) => [
          ...prev,
          {
            from: arrowDragStartSquare,
            to: square,
            color: "rgba(255,170,0,0.7)",
          },
        ]);
        rightDragJustFinishedRef.current = true;
      } else {
        rightDragJustFinishedRef.current = false;
      }
    }
  };

  // * Handle left click anywhere on the board to clear arrows
  const handleBoardClick = (event: React.MouseEvent) => {
    if (event.button === 0) {
      setArrows([]);
    }
  };

  // * Keyboard accessibility: Escape clears arrows
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setArrows([]);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ** TEMPORARY TEST BUTTON - HIDE LATER
  // const handleForceWinForTesting = () => {
  //   // Player is white for this specific test scenario

  //   game.reset();
  //   // Black King a8, White Queen h7, White King a6. White to move. Qb7# is mate.
  //   const testFEN = "k7/7Q/K7/8/8/8/8/8 w - - 0 1";
  //   console.log("[ForceWinTest] FEN before move:", testFEN);
  //   game.load(testFEN);
  //   setBoard(game.board());

  //   // Make the winning move
  //   const winningMove = game.move({ from: "h7", to: "b7" }); // Qb7#

  //   if (winningMove) {
  //     setLastMove({ from: winningMove.from, to: winningMove.to });
  //     const newFen = game.fen();
  //     setHistory(() => [
  //       { fen: testFEN, lastMove: null },
  //       {
  //         fen: newFen,
  //         lastMove: { from: winningMove.from, to: winningMove.to },
  //       },
  //     ]);
  //     setCurrentMove(2);
  //     setBoard(game.board());

  //     if (!gameStarted) {
  //       setGameStarted(true);
  //     }
  //     console.log("Forced win: Checkmate?", game.isCheckmate());
  //   } else {
  //     console.error("Failed to make the forced winning move for testing.");
  //   }
  // };

  useEffect(() => {
    if (initialBot) {
      const botWithoutDifficulty: Bot = {
        id: initialBot.id,
        name: initialBot.name,
        image: initialBot.image,
        rating: initialBot.rating,
        description: initialBot.description,
        skillLevel: initialBot.skillLevel,
        depth: initialBot.depth,
        moveTime: initialBot.moveTime,
        flag: initialBot.flag,
      };

      setSelectedBot(botWithoutDifficulty);
      setShowBotSelection(false);
      setGameStarted(true);

      if (playerColor === "b") {
        game.load("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1");
        setBoard(game.board());
        setHistory([{ fen: game.fen(), lastMove: null }]);
      }

      localStorage.setItem("selectedBot", JSON.stringify(botWithoutDifficulty));
    }
  }, [
    initialBot,
    game,
    playerColor,
    setBoard,
    setHistory,
    setSelectedBot,
    setShowBotSelection,
    setGameStarted,
  ]);

  // Gameplay settings
  const [enablePreMadeMove, setEnablePreMadeMove] = useState(true);
  const [showLegalMoves, setShowLegalMoves] = useState(true);
  const [highlightSquare, setHighlightSquare] = useState(true);

  // Load gameplay settings from session or localStorage
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const user = session.user;
      setEnablePreMadeMove(
        "enablePreMadeMove" in user &&
          typeof user.enablePreMadeMove === "boolean"
          ? user.enablePreMadeMove
          : true
      );
      setShowLegalMoves(
        "showLegalMoves" in user && typeof user.showLegalMoves === "boolean"
          ? user.showLegalMoves
          : true
      );
      setHighlightSquare(
        "highlightSquare" in user && typeof user.highlightSquare === "boolean"
          ? user.highlightSquare
          : true
      );
    } else if (typeof window !== "undefined") {
      setEnablePreMadeMove(true);
      setShowLegalMoves(true);
      setHighlightSquare(true);
    }
  }, [status, session]);

  const [animatingMove, setAnimatingMove] = useState<{
    type: string;
    color: "w" | "b";
    from: string;
    to: string;
  } | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Helper to get piece type and color from previous board state
  const getPieceTypeFromHistory = useCallback(
    (from: string): { type: string; color: "w" | "b" } | null => {
      if (history.length < 2) return null;
      const prevFen = history[history.length - 2].fen;
      const prevBoard = new Chess(prevFen).board();
      const file = "abcdefgh".indexOf(from[0]);
      const rank = 8 - parseInt(from[1]);
      const piece = prevBoard[rank][file];
      if (!piece) return null;
      return { type: piece.type, color: piece.color };
    },
    [history]
  );

  // Trigger animation on lastMove change
  useEffect(() => {
    if (!lastMove || !lastMove.from || !lastMove.to) return;
    const pieceInfo = getPieceTypeFromHistory(lastMove.from);
    if (pieceInfo) {
      setAnimatingMove({
        type: pieceInfo.type,
        color: pieceInfo.color,
        from: lastMove.from,
        to: lastMove.to,
      });
      setIsAnimating(true);
    }
  }, [lastMove, getPieceTypeFromHistory]);

  const handleAnimationEnd = () => {
    setIsAnimating(false);
    setAnimatingMove(null);
  };

  const handlePlayGame = () => {
    setGameStarted(true);
    setIsAwaitingPlay(false);
    setShowBotSelection(false);
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* TEMPORARY TEST BUTTON - HIDE LATER */}
      {/* <button
        onClick={handleForceWinForTesting}
        style={{
          backgroundColor: "rgba(220, 38, 38, 0.8)",
          color: "white",
          padding: "8px 12px",
          margin: "10px",
          borderRadius: "6px",
          border: "1px solid rgba(153, 27, 27, 0.8)",
          cursor: "pointer",
          zIndex: 1000,
          position: "absolute",
          top: "5px",
          right: "5px",
          fontSize: "0.8rem",
          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
        }}
      >
        EZ (Test)
      </button> */}
      {/* END TEMPORARY TEST BUTTON */}

      <main className="flex flex-col w-full items-center justify-start">
        {enablePreMadeMove && (
          <PreMadeMove
            game={game}
            board={board}
            playerColor={playerColor}
            makeMove={makeMove}
            getBotMove={getBotMove}
            onPreMadeMoveChange={handlePreMadeMoveChange}
            onHandleSquareClick={handlePreMadeMoveSquareClick}
            onPossibleMovesChange={handlePreMadePossibleMovesChange}
            setSelectedPiece={setSelectedPiece}
            setPossibleMoves={setPossibleMoves}
          />
        )}

        <div className="flex flex-col lg:flex-row w-full items-center lg:items-start justify-center gap-4 lg:max-h-[calc(100vh-40px)]">
          <div className="relative w-full max-w-[min(85vh,95vw)] sm:max-w-[min(85vh,85vw)] md:max-w-[min(90vh,80vw)] lg:max-w-[107vh]">
            {/* ChessboardArrows SVG overlay */}
            {/* <ChessboardArrows
              arrows={arrows}
              boardSize={boardSize}
              squareSize={boardSize / 8}
              whitePiecesBottom={whitePiecesBottom}
            /> */}
            {/* Chess board and profiles */}
            <div className="flex mb-4 lg:hidden">
              <PlayerProfile
                difficulty={difficulty}
                isBot={true}
                selectedBot={selectedBot}
                lastMove={lastMove}
                game={game}
                playerColor={playerColor}
                capturedPieces={capturedPieces}
                pieceSet={pieceSet}
              />
            </div>

            <div className="flex flex-col lg:flex-row w-full items-center lg:items-start justify-center gap-4">
              <div className="hidden lg:flex flex-col justify-between self-stretch">
                <PlayerProfile
                  difficulty={difficulty}
                  isBot={true}
                  selectedBot={selectedBot}
                  lastMove={lastMove}
                  game={game}
                  playerColor={playerColor}
                  capturedPieces={capturedPieces}
                  pieceSet={pieceSet}
                />
                <div className="mt-4">
                  <PlayerProfile
                    difficulty={difficulty}
                    isBot={false}
                    playerColor={playerColor}
                    capturedPieces={capturedPieces}
                    pieceSet={pieceSet}
                  />
                </div>
              </div>
              {/* New wrapper for the grid and arrows */}
              <div
                className="relative w-full aspect-square rounded-lg overflow-hidden"
                onMouseDown={handleBoardClick}
              >
                {/* Overlay for bot selection - This was previously inside F, but should be sibling to D or even higher to overlay everything if needed */}
                {(!gameStarted || showBotSelection) && (
                  <div className="absolute z-30 inset-0 bg-black/60 rounded-lg flex flex-col items-center justify-center p-6 text-center backdrop-blur-sm">
                    <LockKeyhole className="h-16 w-16 text-white/90 mb-6" />
                    <h3 className="text-3xl font-bold text-white mb-3">
                      Game Not Started
                    </h3>
                    <p className="text-lg text-neutral-200 leading-relaxed">
                      {selectedBot
                        ? "Press 'Play' in the panel to start the game."
                        : "Select a bot and difficulty, then press 'Play' to start the game."}
                    </p>
                  </div>
                )}
                <div
                  className="w-full h-full grid grid-cols-8 border border-border rounded-lg overflow-hidden select-none"
                  ref={boardGridRef}
                >
                  {board.map((row, rowIndex) =>
                    row.map((_, colIndex) => {
                      // Determine if we should flip the board based on player color and settings
                      // By default, always show player's pieces at the bottom
                      const shouldFlipBoard = whitePiecesBottom
                        ? playerColor === "b"
                        : playerColor === "w";

                      const actualRowIndex = shouldFlipBoard
                        ? 7 - rowIndex
                        : rowIndex;
                      const actualColIndex = shouldFlipBoard
                        ? 7 - colIndex
                        : colIndex;
                      const piece = board[actualRowIndex][actualColIndex];
                      const square = `${"abcdefgh"[actualColIndex]}${8 - actualRowIndex}`;
                      const isKingInCheck =
                        game.isCheck() &&
                        piece?.type.toLowerCase() === "k" &&
                        piece?.color === game.turn();
                      const isLastMove =
                        lastMove &&
                        (square === lastMove.from || square === lastMove.to);
                      const isHintMove =
                        hintMove &&
                        (square === hintMove.from || square === hintMove.to);

                      // Calculate the square color
                      const isLight =
                        (actualRowIndex + actualColIndex) % 2 === 1;

                      const isSelected =
                        selectedPiece &&
                        selectedPiece.row === actualRowIndex &&
                        selectedPiece.col === actualColIndex;

                      // Get the coordinates
                      const shouldShowRank =
                        showCoordinates && actualColIndex === 0;
                      const shouldShowFile =
                        showCoordinates && actualRowIndex === 7;
                      const coordinate = shouldShowRank
                        ? `${8 - actualRowIndex}`
                        : shouldShowFile
                          ? `${"abcdefgh"[actualColIndex]}`
                          : undefined;

                      // Determine if the piece can be dragged
                      const canDragPiece =
                        piece?.color === playerColor &&
                        game.turn() === playerColor &&
                        !game.isGameOver();

                      // Move input method logic
                      const enableClick =
                        moveInputMethod === "click" ||
                        moveInputMethod === "both";
                      const enableDrag =
                        moveInputMethod === "drag" ||
                        moveInputMethod === "both";

                      // Hide the piece from the destination square while animating
                      const isAnimatingDest =
                        isAnimating &&
                        animatingMove &&
                        square === animatingMove.to;

                      return (
                        <DroppableSquare
                          key={`${actualRowIndex}-${actualColIndex}`}
                          row={actualRowIndex}
                          col={actualColIndex}
                          isLight={isLight}
                          isSelected={highlightSquare && !!isSelected}
                          isCheck={isKingInCheck}
                          isLastMove={highlightSquare && !!isLastMove}
                          isPossibleMove={
                            showLegalMoves && possibleMoves.includes(square)
                          }
                          isHintMove={highlightSquare && !!isHintMove}
                          isRedHighlighted={isHighlighted(square)}
                          isPreMadeMove={isPreMadeMove(square)}
                          isPreMadePossibleMove={isPreMadePossibleMove(square)}
                          coordinate={coordinate}
                          showRank={shouldShowRank}
                          showFile={shouldShowFile}
                          difficulty={
                            boardTheme === "auto" ? difficulty : boardTheme
                          }
                          boardTheme={boardTheme}
                          onDrop={enableDrag ? handleDragMove : undefined}
                          onClick={
                            enableClick
                              ? () =>
                                  handleSquareClick(
                                    actualRowIndex,
                                    actualColIndex
                                  )
                              : undefined
                          }
                          onContextMenu={(e) => {
                            e.preventDefault();
                            if (rightDragJustFinishedRef.current) {
                              rightDragJustFinishedRef.current = false;
                              return;
                            }
                            handleRightClick(square, e);
                          }}
                          onMouseDown={
                            handleSquareMouseDown
                              ? (e: React.MouseEvent) =>
                                  handleSquareMouseDown(square, e)
                              : undefined
                          }
                          onMouseUp={
                            handleSquareMouseUp
                              ? (e: React.MouseEvent) =>
                                  handleSquareMouseUp(square, e)
                              : undefined
                          }
                        >
                          {piece && !isAnimatingDest && (
                            <DraggablePiece
                              type={piece.type}
                              color={piece.color}
                              position={square}
                              pieceSet={pieceSet}
                              canDrag={enableDrag && canDragPiece}
                              onDragStart={
                                enableDrag ? handleDragStart : undefined
                              }
                            />
                          )}
                        </DroppableSquare>
                      );
                    })
                  )}
                  {/* AnimatedPiece overlay */}
                  {isAnimating && animatingMove && (
                    <AnimatedPiece
                      type={animatingMove.type}
                      color={animatingMove.color}
                      pieceSet={pieceSet}
                      from={animatingMove.from}
                      to={animatingMove.to}
                      squareSize={boardSize / 8}
                      onAnimationEnd={handleAnimationEnd}
                    />
                  )}
                </div>
                <ChessboardArrows
                  arrows={arrows}
                  boardSize={boardSize}
                  squareSize={boardSize / 8}
                  whitePiecesBottom={whitePiecesBottom}
                />
              </div>
            </div>
            {/* MOBILE: profile cards above/below the board */}
            <div className="flex mt-4 lg:hidden">
              <PlayerProfile
                difficulty={difficulty}
                isBot={false}
                playerColor={playerColor}
                capturedPieces={capturedPieces}
                pieceSet={pieceSet}
              />
            </div>
          </div>

          {/* Game Controls on the right */}
          <div className="w-full sm:max-w-[min(85vh,85vw)] md:max-w-[min(90vh,80vw)] lg:w-80 lg:flex flex-col">
            <div className="flex flex-col lg:flex-row w-full lg:items-start sm:items-center justify-center gap-4">
              {/* Bot selection panel */}
              {showBotSelection ? (
                <div className={`w-full ${shouldPulse ? "pulse-border" : ""}`}>
                  <BotSelectionPanel
                    bots={BOTS_BY_DIFFICULTY[difficulty]}
                    onSelectBot={handleSelectBot}
                    difficulty={difficulty}
                    onDifficultyChange={handleDifficultyChange}
                    selectedBot={selectedBot}
                    playerColor={playerColor}
                    onColorChange={handleColorChange}
                    useDirectNavigation={false}
                    onPlayGame={handlePlayGame}
                  />
                </div>
              ) : (
                <div className="w-full">
                  <GameControls
                    difficulty={difficulty}
                    onResign={handleResign}
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
                    onRematch={handleRematch}
                    history={history}
                    pieceSet={pieceSet}
                    onNewBot={handleNewBot}
                    handleNewBotDialog={handleNewBotDialog}
                    onHintRequested={handleHintRequest}
                    isCalculatingHint={isCalculating}
                    selectedBot={selectedBot || undefined}
                  />
                </div>
              )}
            </div>
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
        playerColor={playerColor}
        handleNewBotDialog={handleNewBotDialog}
        selectedBot={selectedBot}
        playerName={playerName}
        gameTime={gameTime}
        movesCount={history.length - 1}
        isResignation={isResignationModal}
        onConfirmResign={handleConfirmResign}
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

      {/* Pawn Promotion Modal */}
      {pendingPromotion && !autoQueen && (
        <PawnPromotionModal
          color={playerColor}
          pieceSet={pieceSet}
          onSelect={handlePromotionSelect}
          onCancel={handlePromotionCancel}
        />
      )}
    </div>
  );
};

export default ChessBoard;
