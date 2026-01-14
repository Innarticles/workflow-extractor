import { Command } from 'commander';
import { compileEvents } from './compiler.js';

export const createProgram = () => {
  const program = new Command();

  program.name('workflow-extractor').description('Workflow extractor CLI').version('0.0.1');

  program
    .command('compile')
    .argument('<eventsPath>', 'Path to events.json')
    .option('--out <outputDir>', 'Output directory', 'out')
    .description('Compile recorded events into workflow artifacts')
    .action(async (eventsPath, options) => {
      const result = await compileEvents(eventsPath, options.out);
      console.log(`Loaded ${result.events.length} events.`);
      console.log(`Wrote output to ${result.outputDirectory}`);
    });

  return program;
};
