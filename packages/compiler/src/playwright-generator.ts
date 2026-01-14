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
const steps: Step[] = ${steps};

const createLocator = (page: any, candidate: string) => {
  const builder = new Function('page', 'return page.' + candidate + ';');
  return builder(page);
};

const resolveLocator = async (page: any, bundle: SelectorBundle) => {
  const candidates = [bundle.primary, ...bundle.fallbacks];
  for (const candidate of candidates) {
    const locator = createLocator(page, candidate);
    if ((await locator.count()) > 0) {
      return locator;
    }
  }
  throw new Error('No locator found for: ' + bundle.primary);
};

const performStep = async (page: any, step: Step) => {
  console.log('[' + step.id + '] ' + step.type);

  if (step.preconditions?.urlMatches) {
    await page.waitForURL(step.preconditions.urlMatches, { waitUntil: 'load' });
  }

  if (step.type === 'NAVIGATE') {
    if (step.effects?.urlMatches) {
      await page.waitForURL(step.effects.urlMatches, { waitUntil: 'load' });
    }
    return;
  }

  const locator = await resolveLocator(page, step.selectors);
  await locator.waitFor({ state: 'visible' });

  if (['CLICK', 'CLICK_SLOT', 'DISMISS_POPUP'].includes(step.type)) {
    await locator.click();
  } else if (['INPUT', 'CHANGE'].includes(step.type)) {
    const value = step.params?.value ? String(step.params.value) : '';
    await locator.fill(value);
  } else if (step.type === 'KEYDOWN') {
    const key = step.params?.key ? String(step.params.key) : 'Enter';
    await locator.press(key);
  } else if (['LOGIN', 'FILL_FORM', 'SUBMIT'].includes(step.type)) {
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
  }

  await page.waitForTimeout(stepDelayMs);
};

const run = async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  if (steps[0]?.preconditions?.urlMatches) {
    await page.goto(steps[0].preconditions.urlMatches);
  }

  for (const step of steps) {
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
