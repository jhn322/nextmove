const MIN_ELO = 100;
const DEFAULT_START_ELO = 600; // Though prisma schema default is authoritative for new users

/**
 * Determines the K-factor based on the player's current ELO.
 * Higher K-factor for lower ELO means ratings change more quickly.
 * @param elo The player's current ELO.
 * @returns The K-factor value.
 */
function getKFactor(elo: number): number {
  if (elo < 1200) return 40;
  if (elo < 2000) return 20;
  // Stockfish in Lichess uses K=20 for <2400, and K=10 for >2400.
  // Let's use K=10 for higher ratings for more stability.
  if (elo < 2400) return 10;
  return 10;
}

/**
 * Calculates the new ELO rating for a player after a game against a bot.
 * @param playerElo The current ELO of the player. Can be null for a first-time calculation.
 * @param opponentElo The ELO of the opponent (bot).
 * @param gameResult 1 for player win, 0 for player loss. (Draws are not handled for ELO change currently).
 * @returns An object containing the new ELO (rounded) and the ELO delta (rounded).
 */
export function calculateNewElo(
  playerElo: number | null | undefined,
  opponentElo: number,
  gameResult: 1 | 0
): { newElo: number; eloDelta: number } {
  const currentElo = playerElo ?? DEFAULT_START_ELO;
  const kFactor = getKFactor(currentElo);

  // Expected score for the player against the opponent
  const expectedScore =
    1 / (1 + Math.pow(10, (opponentElo - currentElo) / 400));

  // Calculate the new ELO
  const newEloCalculated = currentElo + kFactor * (gameResult - expectedScore);

  // Ensure ELO doesn't go below the minimum and round it
  const newEloRounded = Math.max(MIN_ELO, Math.round(newEloCalculated));

  // Calculate the actual change in ELO
  const eloDelta = newEloRounded - currentElo;

  return { newElo: newEloRounded, eloDelta: Math.round(eloDelta) }; // Also round delta for display
}
