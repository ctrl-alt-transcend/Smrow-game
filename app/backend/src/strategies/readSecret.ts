import { readFileSync } from 'node:fs';

export function readSecret(path: string): string {
  if (!path) {
    throw new Error(`Missing environement variable: ${path}`);
  }

  return readFileSync(path, 'utf8').trim();
}
