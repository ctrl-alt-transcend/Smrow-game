import { readFileSync } from 'node:fs';
import { Logger } from '@nestjs/common';

export function readSecret(path: string): string {
  const logger = new Logger('readSecret');

  if (!path) {
    logger.fatal(`Missing environement variable: ${path}`);
    throw new Error(`Missing environement variable: ${path}`);
  }

  return readFileSync(path, 'utf8').trim();
}
