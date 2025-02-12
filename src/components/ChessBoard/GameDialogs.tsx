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
  showResignDialog: boolean;
  showDifficultyDialog: boolean;
  showColorDialog: boolean;
  onConfirmResign: () => void;
  onConfirmDifficultyChange: () => void;
  onConfirmColorChange: () => void;
  onCancelDialog: () => void;
}

const GameDialogs = ({
  showResignDialog,
  showDifficultyDialog,
  showColorDialog,
  onConfirmResign,
  onConfirmDifficultyChange,
  onConfirmColorChange,
  onCancelDialog,
}: GameDialogsProps) => {
  return (
    <>
      <AlertDialog open={showResignDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to resign?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will count as a loss. You cannot undo this action.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={onCancelDialog}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={onConfirmResign}>
              Resign
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
