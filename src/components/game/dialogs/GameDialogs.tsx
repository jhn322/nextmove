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
  onConfirmDifficultyChange: () => void;
  onConfirmColorChange: () => void;
  onCancelDialog: () => void;
}

const GameDialogs = ({
  showDifficultyDialog,
  showColorDialog,
  onConfirmDifficultyChange,
  onConfirmColorChange,
  onCancelDialog,
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
    </>
  );
};

export default GameDialogs;
