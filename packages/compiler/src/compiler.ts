import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { buildFlow } from './flow-builder.js';
import { loadEvents } from './events-loader.js';
import { buildInputTemplate } from './input-template.js';
import { generateLlmRunScript } from './llm-postprocessor.js';
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
  await writeFile(resolve(outputDirectory, 'flow.json'), JSON.stringify(flow, null, 2), 'utf-8');
  await writeFile(resolve(outputDirectory, 'run.ts'), runScript, 'utf-8');
  await writeFile(
    resolve(outputDirectory, 'data.json'),
    JSON.stringify(buildInputTemplate(flow.steps), null, 2),
    'utf-8',
  );

  const llmRunScript = await generateLlmRunScript(flow, runScript);
  if (llmRunScript) {
    await writeFile(resolve(outputDirectory, 'llm-run.ts'), llmRunScript, 'utf-8');
  }

  return { events, flow, outputDirectory };
};
