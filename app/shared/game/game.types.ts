export type Ressources = {
  wood: number;
  brick: number;
  hay: number;
  sheep: number;
  rock: number;
}

export type Player = {
  playerId: string;
  score: number;
  ressources: Ressources;
  //color: ""
}

export type GameState = {
  gameId: string;
  players: Player[];
  playerTurn: string;
}
