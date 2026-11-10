import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DatabaseModule } from '../../database/database.module';
import { DatabaseService } from '../../database/database.service';
import { StatsModule } from '../stats.module';
import { StatsService } from '../stats.service';
import type { GameResult } from 'shared';

/**
 * @brief:   DEV ONLY. Fills the stats tables with fake games until the game
 *           records real ones.
 * @details: Goes through StatsService.recordGameResult, the same path the game
 *           will use. Every existing user gets games, plus a few seed players
 *           that cannot log in. Running it again replaces the previous seed.
 *           usage: docker exec backend npm run seed:stats [-- --clear]
 */

const SEED_EMAIL_DOMAIN = '@seed.local';
const SEED_PLAYERS = [
  'Aldric',
  'Brunhild',
  'Cedric',
  'Dagny',
  'Eirik',
  'Freya',
];
const GAMES_PER_REAL_USER = 12;
const EXTRA_GAMES = 20;
const DAY = 24 * 60 * 60 * 1000;

@Module({ imports: [DatabaseModule, StatsModule] })
class SeedModule {}

const randomInt = (min: number, max: number) =>
  min + Math.floor(Math.random() * (max - min + 1));

const shuffle = <T>(values: T[]) =>
  values
    .map((value) => ({ value, key: Math.random() }))
    .sort((a, b) => a.key - b.key)
    .map(({ value }) => value);

async function clearSeed(db: DatabaseService) {
  const seedUsers = await db.user.findMany({
    where: { email: { endsWith: SEED_EMAIL_DOMAIN } },
    select: { id: true },
  });
  const ids = seedUsers.map((u) => u.id);
  const games = await db.games.deleteMany({
    where: { players: { some: { userId: { in: ids } } } },
  });
  await db.user.deleteMany({ where: { id: { in: ids } } });
  console.log(`Removed ${games.count} seed games and ${ids.length} seed users`);
}

function fakeGame(userIds: string[]): GameResult {
  const ranking = shuffle(userIds);
  return {
    totalTurns: randomInt(30, 80),
    duration: randomInt(15, 60) * 60,
    playedAt: new Date(Date.now() - randomInt(0, 60) * DAY).toISOString(),
    players: shuffle(ranking).map((userId, turnOrder) => {
      const playerRank = ranking.indexOf(userId) + 1;
      return {
        userId,
        turnOrder,
        playerRank,
        isWinner: playerRank === 1,
        winPoints: playerRank === 1 ? 10 : randomInt(2, 10 - playerRank),
        settlementBuilt: randomInt(2, 5),
        citiesBuilt: randomInt(0, 4),
        devCardsBought: randomInt(0, 5),
      };
    }),
  };
}

async function seed(db: DatabaseService, stats: StatsService) {
  await clearSeed(db);

  const seedIds: string[] = [];
  for (const name of SEED_PLAYERS) {
    const user = await db.user.create({
      data: {
        name,
        username: `seed_${name.toLowerCase()}`,
        email: `${name.toLowerCase()}${SEED_EMAIL_DOMAIN}`,
        profile: { create: {} },
      },
    });
    seedIds.push(user.id);
  }

  const realUsers = await db.user.findMany({
    where: { NOT: { email: { endsWith: SEED_EMAIL_DOMAIN } } },
    select: { id: true },
  });

  const opponents = (count: number, exclude: string[] = []) =>
    shuffle(seedIds.filter((id) => !exclude.includes(id))).slice(0, count);

  let created = 0;
  for (const { id } of realUsers) {
    for (let i = 0; i < GAMES_PER_REAL_USER; i++) {
      await stats.recordGameResult(
        fakeGame([id, ...opponents(randomInt(1, 3))]),
      );
      created++;
    }
  }
  for (let i = 0; i < EXTRA_GAMES; i++) {
    await stats.recordGameResult(fakeGame(opponents(randomInt(2, 4))));
    created++;
  }

  console.log(
    `Created ${seedIds.length} seed users and ${created} games ` +
      `(${realUsers.length} real users included)`,
  );
}

async function main() {
  const app = await NestFactory.createApplicationContext(SeedModule, {
    logger: ['error', 'warn'],
  });
  const db = app.get(DatabaseService);

  try {
    if (process.argv.includes('--clear')) await clearSeed(db);
    else await seed(db, app.get(StatsService));
  } finally {
    await app.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
