import { Step } from './flow-types.js';
import { buildSelectorBundle } from './selectors.js';
import { EvidenceEvent } from './types.js';

const getFieldKey = (event: EvidenceEvent) =>
  event.target?.name || event.target?.id || event.target?.placeholder || event.target?.tagName || '';

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
  const pendingInputs = new Map<string, EvidenceEvent>();
  const pendingInputOrder: string[] = [];

  const queuePendingInputs = () => {
    for (const key of pendingInputOrder) {
      const pending = pendingInputs.get(key);
      if (!pending) {
        continue;
      }

      steps.push({
        id: `step-${steps.length + 1}`,
        type: 'INPUT',
        selectors: buildSelectorBundle(pending),
        preconditions: pending.url ? { urlMatches: pending.url } : undefined,
        effects: pending.eventType === 'navigate' ? { urlMatches: pending.url } : undefined,
        params: buildParams(pending),
      });
    }

    pendingInputs.clear();
    pendingInputOrder.length = 0;
  };

  const trackPendingInput = (event: EvidenceEvent) => {
    const fieldKey = getFieldKey(event);
    if (!fieldKey) {
      return;
    }

    pendingInputs.set(fieldKey, event);
    const existingIndex = pendingInputOrder.indexOf(fieldKey);
    if (existingIndex >= 0) {
      pendingInputOrder.splice(existingIndex, 1);
    }
    pendingInputOrder.push(fieldKey);
  };

  events.forEach((event) => {
    let type = event.eventType.toUpperCase();

    if (event.eventType === 'input' || event.eventType === 'change') {
      recentInputs.push(event);
    }

    if (event.eventType === 'submit' || event.eventType === 'keydown') {
      queuePendingInputs();
      recentInputs.length = 0;
    }

    if (event.eventType === 'input') {
      trackPendingInput(event);
      return;
    }

    if (event.eventType === 'change') {
      const fieldKey = getFieldKey(event);
      if (fieldKey) {
        pendingInputs.delete(fieldKey);
        const existingIndex = pendingInputOrder.indexOf(fieldKey);
        if (existingIndex >= 0) {
          pendingInputOrder.splice(existingIndex, 1);
        }
      }
    } else {
      queuePendingInputs();
    }

    if (event.eventType === 'navigate') {
      type = 'NAVIGATE';
    }

    steps.push({
      id: `step-${steps.length + 1}`,
      type,
      selectors: buildSelectorBundle(event),
      preconditions: event.url ? { urlMatches: event.url } : undefined,
      effects: event.eventType === 'navigate' ? { urlMatches: event.url } : undefined,
      params: buildParams(event),
    });
  });

  queuePendingInputs();

  return steps;
};
