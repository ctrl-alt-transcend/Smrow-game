import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { readSecret } from 'src/strategies/readSecret';
import { DB } from '../config/config';

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit {
  constructor() {
    const dbHost = DB.DB_HOST;
    const dbUser = DB.DB_USER;
    const dbPassword: string = readSecret(DB.DB_PASS_FILE); // readSecret('DB_PASSWORD_FILE');  'run/secrets/db_password'
    const dbPort = DB.DB_PORT;
    const dbName = DB.DB_NAME;

    if (!dbHost || !dbUser || !dbName) {
      throw new Error('Incorrect variables "dbHost", "dbUSer", "dbName"');
    }

    const connectionString = `postgres://${encodeURIComponent(dbUser)}:${encodeURIComponent(dbPassword)}@${dbHost}:${dbPort}/${dbName}?schema=public`;

    const adapter = new PrismaPg({ connectionString });
    super({ adapter });
  }
  async onModuleInit() {
    await this.$connect();
  }
}
