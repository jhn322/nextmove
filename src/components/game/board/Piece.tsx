import Image from "next/image";

interface PieceProps {
  type: string;
  variant?: "board" | "symbol";
  pieceSet?: string;
}

const Piece = ({
  type,
  variant = "board",
  pieceSet = "staunty",
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
        className={`text-[min(8vw,6vh)] md:text-[min(4vw,5vh)] ${
          type.toUpperCase() === type ? "text-white" : "text-black"
        }`}
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
        width={80}
        height={80}
        className="w-[80%] h-[80%] object-contain"
        priority
      />
    </div>
  );
};

export default Piece;
