import { useState } from "react";
import { useGameSounds } from "@/hooks/useGameSounds";
import { Chess } from "chess.js";

declare module "chess.js" {
  interface Chess {
    isResigned?: boolean;
  }
}

export const useGameDialogs = () => {
  const [showResignDialog, setShowResignDialog] = useState(false);
  const [showDifficultyDialog, setShowDifficultyDialog] = useState(false);
  const [showColorDialog, setShowColorDialog] = useState(false);
  const [showNewBotDialog, setShowNewBotDialog] = useState(false);
  const [pendingDifficulty, setPendingDifficulty] = useState<string | null>(
    null
  );
  const [pendingColor, setPendingColor] = useState<"w" | "b" | null>(null);
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [isResignationModal, setIsResignationModal] = useState(false);

  // Hook for playing sounds
  const { playSound } = useGameSounds();

  const handleCancelDialog = () => {
    setShowResignDialog(false);
    setShowDifficultyDialog(false);
    setShowColorDialog(false);
    setShowNewBotDialog(false);
    setShowVictoryModal(false);
    setIsResignationModal(false);
  };

  const handleResign = () => {
    setShowVictoryModal(true);
    setIsResignationModal(true);
  };

  const handleConfirmResign = (game: Chess) => {
    game.isResigned = true;
    setIsResignationModal(false);
    setShowVictoryModal(true);
    playSound("game-end");
  };

  const handleDifficultyDialogOpen = (newDifficulty: string) => {
    setPendingDifficulty(newDifficulty);
    setShowDifficultyDialog(true);
  };

  const handleColorDialogOpen = (color: "w" | "b") => {
    setPendingColor(color);
    setShowColorDialog(true);
  };

  const handleRestart = () => {
    Promise.resolve().then(() => {
      setShowVictoryModal(false);
      setIsResignationModal(false);
    });
  };

  const handleNewBotDialog = () => {
    localStorage.removeItem("selectedBot");
    setShowNewBotDialog(true);
  };

  return {
    showResignDialog,
    showDifficultyDialog,
    showColorDialog,
    pendingDifficulty,
    pendingColor,
    showVictoryModal,
    isResignationModal,
    setPendingDifficulty,
    setPendingColor,
    handleCancelDialog,
    handleResign,
    handleConfirmResign,
    handleDifficultyDialogOpen,
    handleColorDialogOpen,
    handleRestart,
    setShowResignDialog,
    setShowDifficultyDialog,
    setShowColorDialog,
    setShowVictoryModal,
    setIsResignationModal,
    showNewBotDialog,
    setShowNewBotDialog,
    handleNewBotDialog,
  };
};
