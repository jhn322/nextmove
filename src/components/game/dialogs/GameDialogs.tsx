import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface GameDialogsProps {
  showDifficultyDialog: boolean;
  showColorDialog: boolean;
  showNewBotDialog: boolean;
  onConfirmDifficultyChange: () => void;
  onConfirmColorChange: () => void;
  onCancelDialog: () => void;
  onConfirmNewBot: () => void;
}

const GameDialogs = ({
  showDifficultyDialog,
  showColorDialog,
  showNewBotDialog,
  onConfirmDifficultyChange,
  onConfirmColorChange,
  onCancelDialog,
  onConfirmNewBot,
}: GameDialogsProps) => {
  return (
    <>
      <AlertDialog open={showDifficultyDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Difficulty?</AlertDialogTitle>
            <AlertDialogDescription>
              This will start a new game. Your current game will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={onCancelDialog}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={onConfirmDifficultyChange}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showColorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Side?</AlertDialogTitle>
            <AlertDialogDescription>
              This will start a new game. Your current game will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={onCancelDialog}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={onConfirmColorChange}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showNewBotDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Choose New Bot?</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset the current game and let you select a new bot.
              Your current game will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={onCancelDialog}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={onConfirmNewBot}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default GameDialogs;
