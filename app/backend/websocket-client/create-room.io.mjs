// Crée une partie, puis connecte N joueurs avec des identifiants aléatoires.
//
// Utilisation :
//   node test-lobby.mjs          → crée une partie + 2 joueurs
//   node test-lobby.mjs 4        → crée une partie + 4 joueurs
//   node test-lobby.mjs 2 <id>   → 2 joueurs rejoignent une partie existante
//
// Avec npm : npm run test:ws -- 4

import { io } from "socket.io-client";
import { randomUUID } from "node:crypto";

const URL = process.env.WS_URL || "http://localhost:3001";
const NB_JOUEURS = Number(process.argv[2]) || 2;
const GAME_ID_EXISTANT = process.argv[3];

// Connecte un client et attend que la connexion soit établie
function connecter(nom) {
  return new Promise((resolve, reject) => {
    const socket = io(URL, { transports: ["websocket"], timeout: 3000 });

    socket.on("connect", () => {
      console.log(`[${nom}] connecté (${socket.id})`);
      resolve(socket);
    });
    socket.on("connect_error", (err) => {
      console.log(`[${nom}] erreur de connexion : ${err.message}`);
      reject(err);
    });

    // Tout ce que le serveur envoie à ce client
    socket.on("message", (msg) => console.log(`[${nom}] message : ${msg}`));
    socket.on("exception", (err) => console.log(`[${nom}] exception :`, err));
  });
}

async function main() {
  // 1. Récupérer l'id de la partie : soit fourni, soit créé par un "hôte"
  let gameId = GAME_ID_EXISTANT;

  if (!gameId) {
    const hote = await connecter("hôte");
    const reponse = await hote.emitWithAck("createRoom", {});
    console.log("[hôte] réponse createRoom :", reponse);

    gameId = reponse.gameId;
    if (!gameId) {
      console.log("Pas de gameId dans la réponse : createRoom doit renvoyer { ok: true, gameId }");
      process.exit(1);
    }
  }

  console.log(`\nPartie utilisée : ${gameId}\n`);

  // 2. Connecter les joueurs, chacun avec un identifiant aléatoire
  for (let i = 1; i <= NB_JOUEURS; i++) {
    const playerId = `joueur-${randomUUID().slice(0, 8)}`;
    const socket = await connecter(playerId);

    const reponse = await socket.emitWithAck("joinRoom", { room: gameId, playerId });
    console.log(`[${playerId}] réponse joinRoom :`, reponse);
  }

  console.log("\nTous les joueurs sont connectés. Ctrl+C pour quitter.");
}

main().catch(() => process.exit(1));
