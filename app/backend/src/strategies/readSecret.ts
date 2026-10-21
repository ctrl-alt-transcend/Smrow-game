import { readFileSync } from 'node:fs';

export function readSecret(fileVariable: string): string {
  const path = process.env[fileVariable];

  if (!path) {
    throw new Error(`Missing environement variable: ${fileVariable}`);
  }

  return readFileSync(path, 'utf8').trim();
}
