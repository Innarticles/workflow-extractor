import { Step } from './flow-types.js';
import { buildSelectorBundle } from './selectors.js';
import { EvidenceEvent } from './types.js';

const isDismissText = (value: string | null) =>
  !!value && /\b(close|dismiss|cancel|x)\b/i.test(value.trim());

const isSlotText = (value: string | null) =>
  !!value && /(\b\d{1,2}:\d{2}\b|\b(am|pm)\b)/i.test(value);

const getEventLabel = (event: EvidenceEvent) =>
  event.target?.ariaLabel || event.target?.innerText || event.context.nearbyLabels[0] || null;

const getFieldKey = (event: EvidenceEvent) =>
  event.target?.name || event.target?.id || event.target?.placeholder || event.target?.tagName || '';

const isLoginSequence = (events: EvidenceEvent[]) =>
  events.some((event) => event.target?.inputType === 'password');

const buildParams = (
  event: EvidenceEvent,
): Record<string, string | number | boolean> | undefined => {
  if (event.eventType === 'input' || event.eventType === 'change') {
    return { value: event.target?.value ?? '' };
  }

  if (event.eventType === 'keydown') {
    return { key: 'Enter' };
  }

  return undefined;
};

export const segmentEvents = (events: EvidenceEvent[]): Step[] => {
  const steps: Step[] = [];
  const recentInputs: EvidenceEvent[] = [];

  events.forEach((event, index) => {
    const id = `step-${index + 1}`;
    let type = event.eventType.toUpperCase();

    if (event.eventType === 'input' || event.eventType === 'change') {
      recentInputs.push(event);
    }

    if (event.eventType === 'submit' || event.eventType === 'keydown') {
      const fieldKeys = new Set(recentInputs.map(getFieldKey).filter(Boolean));
      if (fieldKeys.size >= 2) {
        type = isLoginSequence(recentInputs) ? 'LOGIN' : 'FILL_FORM';
      }
      recentInputs.length = 0;
    }

    if (event.eventType === 'click') {
      const label = getEventLabel(event);
      if (isDismissText(label)) {
        type = 'DISMISS_POPUP';
      } else if (isSlotText(label) || event.target?.classList.some((value) => /slot/i.test(value))) {
        type = 'CLICK_SLOT';
      }
    }

    if (event.eventType === 'navigate') {
      type = 'NAVIGATE';
    }

    steps.push({
      id,
      type,
      selectors: buildSelectorBundle(event),
      preconditions: event.url ? { urlMatches: event.url } : undefined,
      effects: event.eventType === 'navigate' ? { urlMatches: event.url } : undefined,
      params: buildParams(event),
    });
  });

  return steps;
};
