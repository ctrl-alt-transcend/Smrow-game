// Script de test du système d'amis.
// Usage : TARGET=ton_pseudo node seed-friends.mjs   (Node 18+, aucune dépendance)
//
// Ce que fait le script :
//  1. crée USER_COUNT faux utilisateurs avec noms / emails / mots de passe aléatoires
//  2. les connecte pour récupérer un token
//  3. chaque faux user envoie une demande à TARGET (ton vrai compte)
//  4. les faux users s'envoient aussi des demandes entre eux (en chaîne)
//  5. écrit les identifiants créés dans seed-users.json
//  => aucune demande n'est acceptée, tu les acceptes à la main.

import { randomBytes, randomInt } from "node:crypto";
import { writeFileSync } from "node:fs";

// ---------- À ADAPTER ----------
const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const TARGET_USERNAME = process.env.TARGET ?? "ton_username"; // ton vrai compte
const USER_COUNT = Number(process.env.COUNT ?? 20);

const REGISTER_PATH = "/auth/register";
const LOGIN_PATH = "/auth/login";

// Corps envoyés aux routes d'auth : adapte aux champs de RegisterDto / LoginDto
const registerBody = (u) => ({
  email: u.email,
  username: u.username,
  name: u.name,
  password: u.password,
});
const loginBody = (u) => ({
  email: u.email,
  password: u.password,
});
// --------------------------------

const FIRST_NAMES = [
  "Liam", "Emma", "Noah", "Olivia", "Lucas", "Mia", "Hugo", "Lea", "Louis",
  "Chloe", "Nathan", "Zoe", "Ethan", "Lina", "Jules", "Manon", "Adam", "Sarah",
  "Theo", "Alice", "Leo", "Jade", "Gabriel", "Ines", "Arthur", "Camille",
];
const LAST_NAMES = [
  "Martin", "Bernard", "Dubois", "Thomas", "Robert", "Richard", "Petit",
  "Durand", "Leroy", "Moreau", "Simon", "Laurent", "Lefebvre", "Michel",
  "Garcia", "David", "Bertrand", "Roux", "Vincent", "Fournier", "Morel",
];

const pick = (arr) => arr[randomInt(arr.length)];

function randomPassword(length = 14) {
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const digits = "0123456789";
  const symbols = "!@#$%^&*";
  const all = lower + upper + digits + symbols;
  // au moins un caractère de chaque type, pour passer les règles de validation
  const chars = [pick(lower), pick(upper), pick(digits), pick(symbols)];
  while (chars.length < length) chars.push(pick(all));
  // mélange (Fisher-Yates)
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

function randomUser() {
  const first = pick(FIRST_NAMES);
  const last = pick(LAST_NAMES);
  const suffix = randomBytes(2).toString("hex"); // évite les doublons
  const username = `${first}${last}_${suffix}`.toLowerCase();
  return {
    name: `${first} ${last}`,
    username,
    email: `${username}@example.com`,
    password: randomPassword(),
  };
}

async function call(method, path, { body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) {
    // On envoie le token des deux façons : header Bearer et cookie access_token
    // (ton callback Google utilise un cookie, ton guard lit l'un ou l'autre).
    headers.Authorization = `Bearer ${token}`;
    headers.Cookie = `access_token=${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // réponse sans corps JSON
  }
  return { status: res.status, ok: res.ok, data, res };
}

// Récupère le token, qu'il soit dans le body ou dans un cookie Set-Cookie
function extractToken({ data, res }) {
  const fromBody = data?.access_token ?? data?.accessToken ?? data?.token;
  if (fromBody) return fromBody;

  const cookies = res.headers.getSetCookie?.() ?? [];
  for (const c of cookies) {
    const [pair] = c.split(";");
    if (pair.startsWith("access_token=")) return pair.slice("access_token=".length);
  }
  return null;
}

async function main() {
  const sessions = [];

  for (let i = 1; i <= USER_COUNT; i++) {
    const user = randomUser();

    const reg = await call("POST", REGISTER_PATH, { body: registerBody(user) });
    if (!reg.ok) {
      console.warn(
        `[!] register ${user.username} -> ${reg.status}`,
        JSON.stringify(reg.data),
      );
      continue;
    }

    const login = await call("POST", LOGIN_PATH, { body: loginBody(user) });
    const token = login.ok ? extractToken(login) : null;
    if (!token) {
      console.error(
        `[x] login ${user.username} impossible (status ${login.status})`,
        JSON.stringify(login.data),
      );
      continue;
    }

    console.log(`[+] ${user.username} créé et connecté`);
    sessions.push({ ...user, token });
  }

  if (sessions.length === 0) {
    console.error("Aucun utilisateur créé, arrêt. Vérifie les DTO / routes en haut du script.");
    process.exit(1);
  }

  const sendRequest = async (from, toUsername) => {
    const r = await call(
      "POST",
      `/user/friends/add/${encodeURIComponent(toUsername)}`,
      { token: from.token },
    );
    const label = `${from.username} -> ${toUsername}`;
    if (r.ok) console.log(`[+] demande envoyée : ${label}`);
    else console.warn(`[!] ${label} -> ${r.status}`, r.data?.message ?? "");
  };

  // 1) Tous les faux users envoient une demande à ton compte
  for (const s of sessions) await sendRequest(s, TARGET_USERNAME);

  // 2) Demandes entre faux users : 1 -> 2, 2 -> 3, ... (laissées en attente)
  for (let i = 0; i < sessions.length - 1; i++) {
    await sendRequest(sessions[i], sessions[i + 1].username);
  }

  // Sauvegarde des identifiants (sans le token) pour pouvoir te connecter avec
  writeFileSync(
    "seed-users.json",
    JSON.stringify(
      sessions.map(({ token, ...u }) => u),
      null,
      2,
    ),
  );

  console.log(
    `\nTerminé : ${sessions.length} users créés, identifiants dans seed-users.json.` +
      `\nConnecte-toi avec "${TARGET_USERNAME}" pour accepter les demandes en attente.`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});