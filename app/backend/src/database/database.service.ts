import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { readSecret } from 'src/strategies/readSecret';

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit {
  constructor() {
    const dbHost = process.env.DB_HOST;
    const dbUser = process.env.DB_USER;
    const dbPassword: string = readSecret('DB_PASSWORD_FILE'); // readSecret('DB_PASSWORD_FILE');  'run/secrets/db_password'
    const dbPort = process.env.DB_PORT ?? '5432';
    const dbName = process.env.DB_NAME;

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
