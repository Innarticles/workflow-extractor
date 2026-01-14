import { describe, expect, it } from 'vitest';
import { segmentEvents } from '../src/segmenter';
import { EvidenceEvent } from '../src/types';

const baseEvent = (overrides: Partial<EvidenceEvent>): EvidenceEvent => ({
  eventType: 'click',
  timestamp: 1700000000000,
  url: 'https://example.com',
  framePath: ['top'],
  target: {
    tagName: 'input',
    inputType: 'text',
    id: 'email',
    name: 'email',
    classList: [],
    dataAttributes: {},
    ariaLabel: null,
    ariaLabelledby: null,
    role: null,
    placeholder: null,
    title: null,
    innerText: null,
    value: null,
    boundingClientRect: { x: 0, y: 0, width: 100, height: 20 },
    cssPath: '#email',
    xpath: '/html/body/input',
  },
  context: { parentChain: [], nearbyLabels: [] },
  ...overrides,
});

describe('segmentEvents', () => {
  it('classifies login sequences on submit', () => {
    const events: EvidenceEvent[] = [
      baseEvent({
        eventType: 'input',
        target: { ...baseEvent({}).target!, id: 'email', name: 'email' },
      }),
      baseEvent({
        eventType: 'input',
        target: { ...baseEvent({}).target!, id: 'password', name: 'password', inputType: 'password' },
      }),
      baseEvent({ eventType: 'submit', target: { ...baseEvent({}).target!, tagName: 'form' } }),
    ];

    const steps = segmentEvents(events);

    expect(steps[2]?.type).toBe('LOGIN');
  });

});
