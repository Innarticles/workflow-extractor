import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { EvidenceEvent } from './types.js';

export const loadEvents = async (filePath: string): Promise<EvidenceEvent[]> => {
  const absolutePath = resolve(process.cwd(), filePath);
  const raw = await readFile(absolutePath, 'utf-8');
  const parsed = JSON.parse(raw) as unknown;

  if (!Array.isArray(parsed)) {
    throw new Error('Events file must contain a JSON array');
  }

  return parsed as EvidenceEvent[];
};
