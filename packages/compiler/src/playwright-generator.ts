import { Flow, Step } from './flow-types.js';

const serializeSteps = (steps: Step[]) => JSON.stringify(steps, null, 2);

export const generatePlaywrightScript = (flow: Flow) => {
  const steps = serializeSteps(flow.steps);

  return `import { chromium } from 'playwright';

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
