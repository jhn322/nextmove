const difficultyColors = {
  beginner: {
    light: "bg-emerald-200 dark:bg-emerald-900",
    dark: "bg-emerald-300 dark:bg-emerald-800",
  },
  easy: {
    light: "bg-green-200 dark:bg-green-900",
    dark: "bg-green-300 dark:bg-green-800",
  },
  intermediate: {
    light: "bg-cyan-200 dark:bg-cyan-900",
    dark: "bg-cyan-300 dark:bg-cyan-800",
  },
  advanced: {
    light: "bg-blue-200 dark:bg-blue-900",
    dark: "bg-blue-300 dark:bg-blue-800",
  },
  hard: {
    light: "bg-violet-200 dark:bg-violet-900",
    dark: "bg-violet-300 dark:bg-violet-800",
  },
  expert: {
    light: "bg-purple-200 dark:bg-purple-900",
    dark: "bg-purple-300 dark:bg-purple-800",
  },
  master: {
    light: "bg-orange-200 dark:bg-orange-900",
    dark: "bg-orange-300 dark:bg-orange-800",
  },
  grandmaster: {
    light: "bg-red-200 dark:bg-red-900",
    dark: "bg-red-300 dark:bg-red-800",
  },
};

interface SquareProps {
  isLight: boolean;
  isSelected: boolean;
  children?: React.ReactNode;
  onClick: () => void;
  difficulty: string;
  isPossibleMove: boolean;
  isCheck: boolean;
  isLastMove: boolean;
  isHintMove?: boolean;
  isRedHighlighted?: boolean;
  isPreMadeMove?: boolean;
  isPreMadePossibleMove?: boolean;
  coordinate?: string;
  showRank?: boolean;
  showFile?: boolean;
  onContextMenu?: (event: React.MouseEvent) => void;
}

const Square = ({
  isLight,
  isSelected,
  children,
  onClick,
  difficulty,
  isPossibleMove,
  isCheck,
  isLastMove,
  isHintMove = false,
  isRedHighlighted = false,
  isPreMadeMove = false,
  isPreMadePossibleMove = false,
  coordinate,
  showRank,
  showFile,
  onContextMenu,
}: SquareProps) => {
  const colors = difficultyColors[difficulty as keyof typeof difficultyColors];

  // Determine the highlight class based on the square state
  const getHighlightClass = () => {
    if (isCheck) {
      return "before:absolute before:inset-0 before:bg-red-500 before:bg-opacity-40 before:pointer-events-none before:z-20";
    }
    if (isRedHighlighted) {
      return "before:absolute before:inset-0 before:bg-red-600 before:bg-opacity-50 before:pointer-events-none before:z-10";
    }
    if (isPreMadeMove) {
      return "before:absolute before:inset-0 before:bg-blue-500 before:bg-opacity-50 before:pointer-events-none before:z-10";
    }
    if (isHintMove) {
      return "before:absolute before:inset-0 before:bg-purple-500 before:bg-opacity-50 before:pointer-events-none before:z-10 before:animate-pulse";
    }
    if (isSelected || isLastMove) {
      return "before:absolute before:inset-0 before:bg-yellow-400 before:bg-opacity-40 before:pointer-events-none";
    }
    return "";
  };

  return (
    <div
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={`
      relative aspect-square w-full
      ${isLight ? colors.light : colors.dark}
      ${getHighlightClass()}
      cursor-pointer
      transition-all duration-150
      hover:brightness-110
    `}
    >
      {/* Add coordinate labels */}
      {(showRank || showFile) && (
        <div
          className={`absolute text-sm md:text-xl font-semibold
    ${
      isLight
        ? "text-gray-600 dark:text-gray-300"
        : "text-gray-700 dark:text-gray-200"
    }
    ${showRank ? "left-2 top-2" : ""}
    ${showFile ? "right-2 bottom-2" : ""}
  `}
        >
          {coordinate}
        </div>
      )}
      <div className="absolute inset-0 flex items-center justify-center z-5">
        {children}
        {isPossibleMove && !children && (
          <div className="w-10 h-10 max-lg:w-8 max-lg:h-8 rounded-full bg-black bg-opacity-40" />
        )}
        {isPreMadePossibleMove && !children && (
          <div className="w-10 h-10 max-lg:w-8 max-lg:h-8 rounded-full bg-blue-500 bg-opacity-40" />
        )}
      </div>
    </div>
  );
};

export default Square;
