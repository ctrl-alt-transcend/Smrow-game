import type { GameData, GameResult, GameResultPlayer } from 'shared';

/**
 * @brief:   Converts a finished game into the result saved by
 *           StatsService.recordGameResult.
 * @details: Only players with a userId (not dev or bot players) and a place
 *           in the turn order (not joined after the start) are recorded.
 *           The winner is rank 1, the others are ranked by victory points
 *           and share their rank on ties.
 */
export function buildGameResult(
  game: Pick<GameData, 'winner' | 'players' | 'turnOrder'>,
  userIds: ReadonlyMap<string, string>,
  totalTurns: number,
): GameResult {
  const isWinner = (username: string) => username === game.winner;
  const ordered = [...game.players.values()].sort(
    (a, b) =>
      Number(isWinner(b.username)) - Number(isWinner(a.username)) ||
      b.victoryPoints - a.victoryPoints,
  );

  const players: GameResultPlayer[] = [];
  let rank = 0;
  ordered.forEach((p, i) => {
    const prev = ordered[i - 1];
    // index 0 is the winner, nobody can tie with the winner
    const tied = i > 1 && prev.victoryPoints === p.victoryPoints;
    if (!tied) rank = i + 1;

    const userId = userIds.get(p.username);
    const turnOrder = game.turnOrder.indexOf(p.username);
    if (!userId || turnOrder === -1) return;

    const settlements = [...p.settlementsBuilt.values()];
    players.push({
      userId,
      turnOrder,
      winPoints: p.victoryPoints,
      isWinner: isWinner(p.username),
      playerRank: rank,
      settlementBuilt: settlements.length,
      citiesBuilt: settlements.filter((s) => s.isCity).length,
      devCardsBought: 0, // no development cards in the game yet
    });
  });

  return { totalTurns, players };
}
