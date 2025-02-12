interface PieceProps {
  type: string;
}

const Piece = ({ type }: PieceProps) => {
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

  return (
    <div
      className={`text-[min(8vw,6vh)] md:text-[min(4vw,5vh)] ${
        type.toUpperCase() === type ? "text-white" : "text-black"
      }`}
    >
      {getPieceSymbol(type)}
    </div>
  );
};

export default Piece;
