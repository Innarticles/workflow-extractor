export type SelectorBundle = {
  primary: string;
  fallbacks: string[];
};

export type StepEffect = {
  urlMatches?: string;
  elementVisible?: string;
};

export type StepPrecondition = {
  urlMatches?: string;
};

export type Step = {
  id: string;
  type: string;
  selectors: SelectorBundle;
  preconditions?: StepPrecondition;
  effects?: StepEffect;
  params?: Record<string, string | number | boolean>;
};

export type Flow = {
  name: string;
  inputs?: Record<string, string>;
  steps: Step[];
};
