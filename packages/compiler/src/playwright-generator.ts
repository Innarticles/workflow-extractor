import { Flow, Step } from './flow-types.js';

const serializeSteps = (steps: Step[]) => JSON.stringify(steps, null, 2);

export const generatePlaywrightScript = (flow: Flow) => {
  const steps = serializeSteps(flow.steps);

  return `import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

type SelectorBundle = {
  primary: string;
  fallbacks: string[];
};

type Step = {
  id: string;
  type: string;
  selectors: SelectorBundle;
  preconditions?: { urlMatches?: string };
  effects?: { urlMatches?: string; elementVisible?: string };
  params?: Record<string, string | number | boolean>;
};

type InputOverrides = {
  byTestId?: Record<string, string | number | boolean>;
  byName?: Record<string, string | number | boolean>;
  byId?: Record<string, string | number | boolean>;
  byLabel?: Record<string, string | number | boolean>;
  byPlaceholder?: Record<string, string | number | boolean>;
  fields?: Record<string, string | number | boolean>;
};

const stepDelayMs = 500;
const locatorWaitTimeoutMs = 8000;
const steps: Step[] = ${steps};

const hasMatchingSelectors = (left: SelectorBundle, right: SelectorBundle) => {
  if (left.primary !== right.primary) {
    return false;
  }

  if (left.fallbacks.length !== right.fallbacks.length) {
    return false;
  }

  return left.fallbacks.every((fallback, index) => fallback === right.fallbacks[index]);
};

const shouldSkipFocusStep = (step: Step, nextStep?: Step) => {
  if (step.type !== 'FOCUS' || !nextStep) {
    return false;
  }

  return (
    (nextStep.type === 'CLICK' || nextStep.type === 'LOGIN') &&
    hasMatchingSelectors(step.selectors, nextStep.selectors)
  );
};

// No app-specific step types are emitted. Keep only generic types.

const stepsToRun = steps.filter((step, index) => {
  if (shouldSkipFocusStep(step, steps[index + 1])) {
    return false;
  }

  const previousStep = index > 0 ? steps[index - 1] : undefined;
  if (
    step.type === 'SUBMIT' &&
    previousStep?.type === 'CLICK' &&
    (hasMatchingSelectors(step.selectors, previousStep.selectors) ||
      step.preconditions?.urlMatches === previousStep.preconditions?.urlMatches)
  ) {
    return false;
  }

  return true;
});

const createLocator = (page: any, candidate: string) => {
  const builder = new Function('page', 'return page.' + candidate + ';');
  return builder(page);
};

const resolveLocator = async (page: any, bundle: SelectorBundle) => {
  const candidates = [bundle.primary, ...bundle.fallbacks];
  for (const candidate of candidates) {
    const locator = createLocator(page, candidate);
    try {
      await locator.waitFor({ state: 'visible', timeout: locatorWaitTimeoutMs });
      return locator;
    } catch {
      // Try the next selector candidate.
    }
  }
  throw new Error('No locator found for: ' + bundle.primary);
};

const normalizeSelector = (selector: string) =>
  selector.replace(/\\\\"/g, '"').replace(/\\\\'/g, "'");

const extractSelectorKeys = (selector: string) => {
  const normalized = normalizeSelector(selector);
  const keys = {
    testIds: [] as string[],
    names: [] as string[],
    ids: [] as string[],
    labels: [] as string[],
    placeholders: [] as string[],
  };

  const testIdMatch = normalized.match(/getByTestId\\(["'](.+?)["']\\)/);
  if (testIdMatch?.[1]) {
    keys.testIds.push(testIdMatch[1]);
  }

  const labelMatch = normalized.match(/getByLabel\\(["'](.+?)["']\\)/);
  if (labelMatch?.[1]) {
    keys.labels.push(labelMatch[1]);
  }

  const placeholderMatch = normalized.match(/getByPlaceholder\\(["'](.+?)["']\\)/);
  if (placeholderMatch?.[1]) {
    keys.placeholders.push(placeholderMatch[1]);
  }

  const roleNameMatch = normalized.match(
    /getByRole\\([^,]+,\\s*\\{[^}]*name:\\s*["'](.+?)["'][^}]*\\}\\)/,
  );
  if (roleNameMatch?.[1]) {
    keys.labels.push(roleNameMatch[1]);
  }

  const nameMatch = normalized.match(/\\[name\\s*=\\s*["']?([^"'\\]]+)["']?\\]/);
  if (nameMatch?.[1]) {
    keys.names.push(nameMatch[1]);
  }

  const idMatch = normalized.match(/locator\\(["']#([^"']+)["']\\)/);
  if (idMatch?.[1]) {
    keys.ids.push(idMatch[1]);
  }

  return keys;
};

const findOverrideValue = (step: Step, overrides: InputOverrides) => {
  const selectors = [step.selectors.primary, ...step.selectors.fallbacks];
  const keys = {
    testIds: [] as string[],
    names: [] as string[],
    ids: [] as string[],
    labels: [] as string[],
    placeholders: [] as string[],
  };

  for (const selector of selectors) {
    const extracted = extractSelectorKeys(selector);
    keys.testIds.push(...extracted.testIds);
    keys.names.push(...extracted.names);
    keys.ids.push(...extracted.ids);
    keys.labels.push(...extracted.labels);
    keys.placeholders.push(...extracted.placeholders);
  }

  const searchOrder: Array<[keyof InputOverrides, string[]]> = [
    ['byTestId', keys.testIds],
    ['byName', keys.names],
    ['byId', keys.ids],
    ['byLabel', keys.labels],
    ['byPlaceholder', keys.placeholders],
  ];

  for (const [group, groupKeys] of searchOrder) {
    const map = overrides[group];
    if (!map) {
      continue;
    }
    for (const key of groupKeys) {
      if (Object.prototype.hasOwnProperty.call(map, key)) {
        return map[key];
      }
    }
  }

  const fallbackMap = overrides.fields;
  if (fallbackMap) {
    for (const key of [
      ...keys.testIds,
      ...keys.names,
      ...keys.ids,
      ...keys.labels,
      ...keys.placeholders,
    ]) {
      if (Object.prototype.hasOwnProperty.call(fallbackMap, key)) {
        return fallbackMap[key];
      }
    }
  }

  return undefined;
};

const applyInputOverrides = (stepsToRun: Step[], overrides: InputOverrides) => {
  for (const step of stepsToRun) {
    if (!['INPUT', 'CHANGE'].includes(step.type)) {
      continue;
    }

    const value = findOverrideValue(step, overrides);
    if (value !== undefined) {
      step.params = { ...(step.params ?? {}), value };
    }
  }
};

const loadInputOverrides = async () => {
  const runDir = dirname(fileURLToPath(import.meta.url));
  const dataPath = resolve(runDir, 'data.json');
  try {
    const raw = await readFile(dataPath, 'utf-8');
    return JSON.parse(raw) as InputOverrides;
  } catch (error: any) {
    if (error?.code !== 'ENOENT') {
      console.warn('Failed to read output/data.json:', error);
    }
    return {};
  }
};

const performStep = async (page: any, step: Step) => {
  console.log('[' + step.id + '] ' + step.type);

  if (step.type === 'NAVIGATE') {
    if (step.effects?.urlMatches) {
      await page.waitForURL(step.effects.urlMatches, { waitUntil: 'load' });
      await page.waitForLoadState('networkidle');
    }
    return;
  }

  const locator = await resolveLocator(page, step.selectors);
  await locator.waitFor({ state: 'visible' });

  if (['CLICK'].includes(step.type)) {
    await locator.click();
  } else if (['INPUT', 'CHANGE'].includes(step.type)) {
    const value = step.params?.value ? String(step.params.value) : '';
    const tagName = await locator.evaluate((element) => element.tagName.toLowerCase());
    if (tagName === 'select') {
      await locator.selectOption(value);
    } else {
      await locator.fill(value);
    }
  } else if (step.type === 'KEYDOWN') {
    const key = step.params?.key ? String(step.params.key) : 'Enter';
    await locator.press(key);
  } else if (step.type === 'SUBMIT') {
    await locator.click();
    await page.keyboard.press('Enter');
  } else {
    await locator.click();
  }

  if (step.effects?.elementVisible) {
    await page.locator(step.effects.elementVisible).waitFor({ state: 'visible' });
  }

  if (step.effects?.urlMatches) {
    await page.waitForURL(step.effects.urlMatches, { waitUntil: 'load' });
    await page.waitForLoadState('networkidle');
  }

  await page.waitForTimeout(stepDelayMs);
};

const run = async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  const overrides = await loadInputOverrides();
  applyInputOverrides(stepsToRun, overrides);

  if (stepsToRun[0]?.preconditions?.urlMatches) {
    await page.goto(stepsToRun[0].preconditions.urlMatches);
  }

  for (const step of stepsToRun) {
    await performStep(page, step);
  }

  await browser.close();
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
`;
};
