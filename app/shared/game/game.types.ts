export type Ressources = {
  wood: number;
  brick: number;
  hay: number;
  sheep: number;
  rock: number;
}

export type Player = {
  playerId: string;
  username: string;
  score: number;
  level: number;
  ressources: Ressources;
  //color: ""
  avatarURL: string | null;
}

export type GameState = {
  gameId: string;
  players: Player[];
  playerTurn: string;
}

//INFO: data we need to colect from the database when a client join a game
export type PlayerProfile = {
  id: string;
  username: string;
  //level: number;
  avatarURL: string | null;
}
