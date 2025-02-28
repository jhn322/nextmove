import Image from "next/image";

interface PieceProps {
  type: string;
  variant?: "board" | "symbol";
  pieceSet?: string;
  forceColor?: "light" | "dark";
}

const Piece = ({
  type,
  variant = "board",
  pieceSet = "staunty",
  forceColor,
}: PieceProps) => {
  // Convert piece type to Unicode chess symbol
  const getPieceSymbol = (type: string) => {
    const pieces: { [key: string]: string } = {
      K: "♔",
      Q: "♕",
      R: "♖",
      B: "♗",
      N: "♘",
      P: "♙",
      k: "♚",
      q: "♛",
      r: "♜",
      b: "♝",
      n: "♞",
      p: "♟",
    };
    return pieces[type];
  };

  // Get the correct SVG path based on piece type and set
  const getPieceSVG = (type: string) => {
    const color = type.toUpperCase() === type ? "w" : "b";
    const piece = type.toLowerCase();
    return `/pieces/${pieceSet}/${color}${piece}.svg`;
  };

  if (variant === "symbol") {
    return (
      <div
        className={`${
          forceColor
            ? forceColor === "dark"
              ? "text-white dark:text-white"
              : "text-black dark:text-white"
            : type.toUpperCase() === type
            ? "text-white dark:text-white"
            : "text-black dark:text-black"
        } text-xl sm:text-2xl`}
      >
        {getPieceSymbol(type)}
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <Image
        src={getPieceSVG(type)}
        alt={`${type} chess piece`}
        width={90}
        height={90}
        className="w-[90%] h-[90%] object-contain"
        priority
      />
    </div>
  );
};

export default Piece;
