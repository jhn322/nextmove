import React from "react";

export const boardThemes: Record<string, { light: string; dark: string }> = {
  // Non-difficulty themes
  amethyst: {
    light: "bg-purple-200 dark:bg-purple-900",
    dark: "bg-purple-400 dark:bg-purple-800",
  },
  amber: {
    light: "bg-amber-200 dark:bg-amber-900",
    dark: "bg-amber-300 dark:bg-amber-800",
  },
  classic: {
    light: "bg-yellow-100 dark:bg-yellow-900",
    dark: "bg-yellow-200 dark:bg-yellow-800",
  },
  comic: {
    light: "bg-yellow-100 dark:bg-yellow-900",
    dark: "bg-blue-200 dark:bg-blue-800",
  },
  crimson: {
    light: "bg-rose-200 dark:bg-rose-900",
    dark: "bg-rose-400 dark:bg-rose-800",
  },
  cyberpunk: {
    light: "bg-fuchsia-200 dark:bg-fuchsia-900",
    dark: "bg-fuchsia-400 dark:bg-fuchsia-800",
  },
  dracula: {
    light: "bg-purple-300 dark:bg-purple-900",
    dark: "bg-purple-400 dark:bg-purple-800",
  },
  emerald: {
    light: "bg-emerald-200 dark:bg-emerald-900",
    dark: "bg-emerald-300 dark:bg-emerald-800",
  },
  fantasy: {
    light: "bg-pink-200 dark:bg-pink-900",
    dark: "bg-pink-300 dark:bg-pink-800",
  },
  "high-contrast": {
    light: "bg-black text-white border-2 border-white",
    dark: "bg-yellow-400 text-black border-2 border-white",
  },
  jade: {
    light: "bg-green-200 dark:bg-green-900",
    dark: "bg-green-300 dark:bg-green-800",
  },
  midnight: {
    light: "bg-gray-300 dark:bg-gray-900",
    dark: "bg-gray-400 dark:bg-gray-800",
  },
  pokemon: {
    light: "bg-yellow-200 dark:bg-yellow-900",
    dark: "bg-blue-200 dark:bg-blue-900",
  },
  rose: {
    light: "bg-rose-200 dark:bg-rose-900",
    dark: "bg-rose-300 dark:bg-rose-800",
  },

  // Difficulty themes
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
  onClick?: () => void;
  difficulty: string;
  boardTheme?: string;
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
  boardTheme,
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
  let colors = boardThemes[difficulty];
  if (boardTheme && boardTheme !== "auto" && boardThemes[boardTheme]) {
    colors = boardThemes[boardTheme];
  }

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
      return "before:absolute before:inset-0 before:bg-fuchsia-500 before:bg-opacity-50 before:pointer-events-none before:z-10 before:animate-pulse";
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
          <div className="w-4 h-4 sm:w-6 sm:h-6 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-10 xl:h-10 rounded-full bg-black bg-opacity-40" />
        )}
        {isPreMadePossibleMove && !children && (
          <div className="w-4 h-4 sm:w-6 sm:h-6 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-10 xl:h-10 rounded-full bg-blue-500 bg-opacity-40" />
        )}
      </div>
    </div>
  );
};

export default Square;
