import { useState } from "react";

export const useGameDialogs = () => {
  const [showResignDialog, setShowResignDialog] = useState(false);
  const [showDifficultyDialog, setShowDifficultyDialog] = useState(false);
  const [pendingDifficulty, setPendingDifficulty] = useState<string | null>(
    null
  );
  const [showColorDialog, setShowColorDialog] = useState(false);
  const [pendingColor, setPendingColor] = useState<"w" | "b" | null>(null);

  const handleCancelDialog = () => {
    setShowResignDialog(false);
    setShowDifficultyDialog(false);
    setShowColorDialog(false);
  };

  const handleResign = () => {
    setShowResignDialog(true);
  };

  const handleDifficultyDialogOpen = (newDifficulty: string) => {
    setPendingDifficulty(newDifficulty);
    setShowDifficultyDialog(true);
  };

  const handleColorDialogOpen = (color: "w" | "b") => {
    setPendingColor(color);
    setShowColorDialog(true);
  };

  return {
    showResignDialog,
    showDifficultyDialog,
    showColorDialog,
    pendingDifficulty,
    pendingColor,
    setPendingDifficulty,
    setPendingColor,
    handleCancelDialog,
    handleResign,
    handleDifficultyDialogOpen,
    handleColorDialogOpen,
    setShowResignDialog,
    setShowDifficultyDialog,
    setShowColorDialog,
  };
};
