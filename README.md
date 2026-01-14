# Workflow Extractor MVP

Workflow Extractor records browser interactions in a Chrome extension, exports them as evidence,
compiles them into a Flow DSL, and generates a runnable Playwright script.

## Requirements

- Node.js 20+
- pnpm 9+
- Chrome (for the extension)

## Setup

```bash
pnpm install
```

## Dev Workflow

Start the extension build watch and demo server:

```bash
pnpm dev
```

This runs:

- Extension watch build (outputs `packages/extension/dist`)
- Demo server at `http://localhost:3000/demo/index.html`

## Build

```bash
pnpm build
```

## Load the Extension

1. Run `pnpm --filter @workflow-extractor/extension build`.
2. Open `chrome://extensions` and enable Developer Mode.
3. Click **Load unpacked** and select `packages/extension/dist`.

## Record a Demo Flow

1. Start the demo server: `pnpm --filter @workflow-extractor/compiler dev`.
2. Visit `http://localhost:3000/demo/index.html`.
3. Open the extension popup and click **Start Recording**.
4. Complete the login and schedule flow.
5. Click **Stop Recording** and **Export JSON**.

## Compile Events

```bash
pnpm --filter @workflow-extractor/compiler build
node packages/compiler/dist/cli.js compile <path-to-events.json> --out ./output
```

Output files:

- `output/events.json`
- `output/flow.json`
- `output/run.ts`

## Run the Generated Playwright Script

```bash
pnpm exec playwright install
pnpm run run:output
```

## Tests

```bash
pnpm -r test
```

Single test examples:

```bash
pnpm --filter @workflow-extractor/compiler test -- tests/segmenter.test.ts
pnpm --filter @workflow-extractor/extension test -- tests/evidence.test.ts
```

## Examples

Sample artifacts live in `examples/`:

- `examples/events.json`
- `examples/flow.json`
- `examples/run.ts`
