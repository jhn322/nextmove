import { useState } from "react";

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

  const handleConfirmResign = () => {
    setIsResignationModal(false);
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
