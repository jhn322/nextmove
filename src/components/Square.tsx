const difficultyColors = {
  easy: {
    light: "bg-green-200 dark:bg-green-900",
    dark: "bg-green-300 dark:bg-green-800",
  },
  intermediate: {
    light: "bg-blue-200 dark:bg-blue-900",
    dark: "bg-blue-300 dark:bg-blue-800",
  },
  hard: {
    light: "bg-orange-200 dark:bg-orange-900",
    dark: "bg-orange-300 dark:bg-orange-800",
  },
  expert: {
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
}

const Square = ({
  isLight,
  isSelected,
  children,
  onClick,
  difficulty,
}: SquareProps) => {
  const colors = difficultyColors[difficulty as keyof typeof difficultyColors];

  return (
    <div
      onClick={onClick}
      className={`
        relative aspect-square w-full
        ${isLight ? colors.light : colors.dark}
        ${isSelected ? "ring-2 ring-blue-500" : ""}
        cursor-pointer
      `}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export default Square;
