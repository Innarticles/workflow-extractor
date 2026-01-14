import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { buildFlow } from './flow-builder.js';
import { loadEvents } from './events-loader.js';
import { generatePlaywrightScript } from './playwright-generator.js';

export const compileEvents = async (inputPath: string, outDir: string) => {
  const events = await loadEvents(inputPath);
  const outputDirectory = resolve(process.cwd(), outDir);
  const flow = buildFlow(events);
  const runScript = generatePlaywrightScript(flow);

  await mkdir(outputDirectory, { recursive: true });
  await writeFile(
    resolve(outputDirectory, 'events.json'),
    JSON.stringify(events, null, 2),
    'utf-8',
  );
  await writeFile(
    resolve(outputDirectory, 'flow.json'),
    JSON.stringify(flow, null, 2),
    'utf-8',
  );
  await writeFile(resolve(outputDirectory, 'run.ts'), runScript, 'utf-8');

  return { events, flow, outputDirectory };
};
