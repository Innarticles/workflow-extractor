import { describe, expect, it } from 'vitest';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEvents } from '../src/events-loader';

describe('loadEvents', () => {
  it('loads evidence events from JSON', async () => {
    const currentDir = resolve(fileURLToPath(new URL('.', import.meta.url)));
    const filePath = resolve(currentDir, 'fixtures/events.json');

    const events = await loadEvents(filePath);

    expect(events).toHaveLength(1);
    expect(events[0]?.eventType).toBe('click');
    expect(events[0]?.target?.tagName).toBe('button');
  });
});
