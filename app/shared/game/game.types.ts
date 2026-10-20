export type Ressources = {
  wood: number;
  brick: number;
  hay: number;
  sheep: number;
  rock: number;
}

export type GameLoopData = {
  firstRoll: number;
  secondRoll: number;
  roadsBuilt: number;
  settlementsBuilt: number;
}


export type Player = {
  playerId: string;
  score: number;
  ressources: Ressources;
  firstDice: number,
  secondDice: number
  //color: ""
}

export type GameState = {
  gameId: string;
  players: Player[];
  playerTurn: string;
}
