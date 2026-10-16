export type GameStatus = "waiting" | "playing";

export type Game = {
  id: string;
  players: string[];
  maxPlayers: number;
  status: GameStatus;
};

export const games: Game[] = [
  {
    id: "A111",
    players: ["Hay", "Mag", "The", "Enr", "Eli"],
    maxPlayers: 5,
    status: "waiting",
  },
  {
    id: "A112",
    players: ["Hay", "Mag", "The", "Enr"],
    maxPlayers: 5,
    status: "waiting",
  },
  {
    id: "A113",
    players: ["Hay", "Mag", "The", "Enr", "Eli"],
    maxPlayers: 5,
    status: "playing",
  },
  { id: "A114", players: ["Hay"], maxPlayers: 4, status: "waiting" },
];
