import { build, context } from 'esbuild';
import { copyFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const root = resolve(process.cwd());
const dist = resolve(root, 'dist');
const watch = process.argv.includes('--watch');

await mkdir(dist, { recursive: true });

const entryPoints = {
  background: resolve(root, 'src/background.ts'),
  content: resolve(root, 'src/content.ts'),
  popup: resolve(root, 'src/popup.ts'),
};

const assets = [
  ['src/manifest.json', 'manifest.json'],
  ['src/popup.html', 'popup.html'],
];

await Promise.all(
  assets.map(async ([from, to]) => {
    const source = resolve(root, from);
    const destination = resolve(dist, to);
    await mkdir(dirname(destination), { recursive: true });
    await copyFile(source, destination);
  }),
);

if (watch) {
  const watchContext = await context({
    entryPoints,
    bundle: true,
    format: 'iife',
    outdir: dist,
    target: 'es2022',
    sourcemap: true,
    logLevel: 'info',
  });
  await watchContext.watch();
  console.log('Watching extension bundle...');
} else {
  await build({
    entryPoints,
    bundle: true,
    format: 'iife',
    outdir: dist,
    target: 'es2022',
    sourcemap: true,
    logLevel: 'info',
  });
}
