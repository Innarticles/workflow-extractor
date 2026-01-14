export type EvidenceEventType =
  | 'click'
  | 'input'
  | 'change'
  | 'keydown'
  | 'submit'
  | 'navigate'
  | 'focus';

export type BoundingRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type ParentSnapshot = {
  tagName: string;
  id: string | null;
  name: string | null;
  classList: string[];
  role: string | null;
  textSnippet: string | null;
};

export type ContextSnapshot = {
  parentChain: ParentSnapshot[];
  nearbyLabels: string[];
};

export type TargetFingerprint = {
  tagName: string;
  inputType: string | null;
  id: string | null;
  name: string | null;
  classList: string[];
  dataAttributes: Record<string, string>;
  ariaLabel: string | null;
  ariaLabelledby: string | null;
  role: string | null;
  placeholder: string | null;
  title: string | null;
  innerText: string | null;
  value: string | null;
  boundingClientRect: BoundingRect | null;
  cssPath: string | null;
  xpath: string | null;
};

export type EvidenceEvent = {
  eventType: EvidenceEventType;
  timestamp: number;
  url: string;
  framePath: string[];
  target: TargetFingerprint | null;
  context: ContextSnapshot;
};

export type RecorderStatus = {
  isRecording: boolean;
  count: number;
};

export type RecorderMessage =
  | { type: 'recorder:event'; payload: EvidenceEvent }
  | { type: 'recorder:start' }
  | { type: 'recorder:stop' }
  | { type: 'recorder:clear' }
  | { type: 'recorder:status' }
  | { type: 'recorder:export' };
