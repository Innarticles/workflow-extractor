import { describe, expect, it } from 'vitest';
import { generatePlaywrightScript } from '../src/playwright-generator';
import { Flow } from '../src/flow-types';

describe('generatePlaywrightScript', () => {
  it('includes steps and playwright bootstrapping', () => {
    const flow: Flow = {
      name: 'demo',
      steps: [
        {
          id: 'step-1',
          type: 'CLICK',
          selectors: { primary: 'getByTestId("save")', fallbacks: [] },
        },
      ],
    };

    const script = generatePlaywrightScript(flow);

    expect(script).toContain('chromium');
    expect(script).toContain('step-1');
    expect(script).toContain('performStep');
  });
});
