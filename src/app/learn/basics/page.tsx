// * ==========================================================================
// *                        LEARN - BASICS OF CHESS
// * ==========================================================================

export default function BasicsPage() {
  return (
    <article className="prose dark:prose-invert max-w-none">
      <h1>Basics of Chess</h1>
      <p>
        Welcome to the fundamentals of chess! Understanding these basic concepts
        is the first step to becoming a proficient chess player.
      </p>

      <h2>The Chessboard</h2>
      <p>
        Chess is played on a square board divided into 64 smaller squares,
        arranged in an 8x8 grid. The squares are alternately light and dark
        (often referred to as &quot;white&quot; and &quot;black&quot; squares).
        When setting up the board, ensure that each player has a light-colored
        square at their bottom-right corner.
      </p>
      <p>
        The board has rows called <strong>ranks</strong> (numbered 1 to 8) and
        columns called <strong>files</strong> (lettered a to h). Each square has
        a unique coordinate, like a1, e4, or h8.
      </p>

      <h2>Objective of the Game</h2>
      <p>
        The primary goal in chess is to <strong>checkmate</strong> your
        opponent&apos;s King. Checkmate occurs when a player&apos;s King is
        under attack (in &quot;check&quot;) and there is no legal move to escape
        the attack. More on check and checkmate later!
      </p>

      <h2>Setting Up the Board</h2>
      <p>
        Each player starts with 16 pieces. The pieces are placed on the board in
        a specific arrangement:
      </p>
      <ul>
        <li>
          <strong>Rooks (or Castles):</strong> Positioned on the corners (a1, h1
          for White; a8, h8 for Black).
        </li>
        <li>
          <strong>Knights (or Horses):</strong> Placed next to the Rooks (b1, g1
          for White; b8, g8 for Black).
        </li>
        <li>
          <strong>Bishops:</strong> Placed next to the Knights (c1, f1 for
          White; c8, f8 for Black).
        </li>
        <li>
          <strong>Queen:</strong> Placed on her own color in the center of the
          back rank (d1 for White, on a light square; d8 for Black, on a dark
          square).
        </li>
        <li>
          <strong>King:</strong> Placed next to the Queen on the remaining
          central square (e1 for White, on a dark square; e8 for Black, on a
          light square).
        </li>
        <li>
          <strong>Pawns:</strong> Occupy the entire second rank in front of the
          other pieces (rank 2 for White; rank 7 for Black).
        </li>
      </ul>
      <p>
        White always moves first. After White makes a move, Black makes a move,
        and players alternate turns until the game ends.
      </p>

      <p>
        Now that you know how to set up the board and the game&apos;s objective,
        let&apos;s move on to how each piece moves!
      </p>
    </article>
  );
}
