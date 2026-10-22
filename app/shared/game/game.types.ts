export type Ressources = {
  wood: number;
  brick: number;
  hay: number;
  sheep: number;
  rock: number;
}

export type GameLoopData = {
  firstDice: number;
  secondDice: number;
  roadsBuilt: number;
  settlementsBuilt: number;
}


export type Player = {
  playerId: string;
  score: number;
  ressources: Ressources;
  firstDice: number,
  secondDice: number,
  //color: ""
  //resetDice(): Function
}

export type GameState = {
  gameId: string;
  players: Player[];
  playerTurn: string;
}
