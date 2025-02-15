interface PieceSetSelectorProps {
  onChange: (set: string) => void;
  currentSet: string;
}

const PieceSetSelector = ({ onChange, currentSet }: PieceSetSelectorProps) => {
  const pieceSets = [
    "california",
    "cardinal",
    "cburnett",
    "chessicons",
    "chessmonk",
    "chessnut",
    "freestaunton",
    "fresca",
    "gioco",
    "governor",
    "icpieces",
    "kosal",
    "maestro",
    "merida_new",
    "pixel",
    "riohacha",
    "staunty",
    "tatiana",
  ];

  return (
    <select
      value={currentSet}
      onChange={(e) => onChange(e.target.value)}
      className="p-2 border rounded"
    >
      {pieceSets.map((set) => (
        <option key={set} value={set}>
          {set.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
        </option>
      ))}
    </select>
  );
};

export default PieceSetSelector;
