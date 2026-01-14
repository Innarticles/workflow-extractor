import { Flow } from './flow-types.js';
import { segmentEvents } from './segmenter.js';
import { EvidenceEvent } from './types.js';

export const buildFlow = (events: EvidenceEvent[]): Flow => {
  const name = events[0]?.url ? new URL(events[0].url).hostname : 'workflow';

  return {
    name,
    steps: segmentEvents(events),
  };
};
