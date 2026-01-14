import { describe, expect, it } from 'vitest';
import { buildSelectorBundle } from '../src/selectors';
import { EvidenceEvent } from '../src/types';

describe('buildSelectorBundle', () => {
  it('prioritizes data-testid and role selectors', () => {
    const event: EvidenceEvent = {
      eventType: 'click',
      timestamp: 1700000000000,
      url: 'https://example.com',
      framePath: ['top'],
      target: {
        tagName: 'button',
        inputType: null,
        id: 'submit',
        name: null,
        classList: ['primary'],
        dataAttributes: {
          'data-testid': 'save-button',
        },
        ariaLabel: 'Save',
        ariaLabelledby: null,
        role: 'button',
        placeholder: null,
        title: null,
        innerText: 'Save',
        value: null,
        boundingClientRect: { x: 0, y: 0, width: 100, height: 32 },
        cssPath: '#submit',
        xpath: '/html/body/button',
      },
      context: {
        parentChain: [],
        nearbyLabels: [],
      },
    };

    const bundle = buildSelectorBundle(event);

    expect(bundle.primary).toBe('getByTestId("save-button")');
    expect(bundle.fallbacks[0]).toBe('getByRole("button", { name: "Save" })');
  });
});
