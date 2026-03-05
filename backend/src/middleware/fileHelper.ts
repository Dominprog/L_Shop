import fs from 'fs';
import path from 'path';

const dataDir = path.join(__dirname, '../data');

export function readJson<T>(filename: string): T {
  const filePath = path.join(dataDir, filename);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

export function writeJson<T>(filename: string, data: T): void {
  const filePath = path.join(dataDir, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}
