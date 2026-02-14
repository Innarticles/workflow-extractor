import { Step } from './flow-types.js';

export type InputTemplate = {
  byTestId: Record<string, string | number | boolean>;
  byName: Record<string, string | number | boolean>;
  byId: Record<string, string | number | boolean>;
  byLabel: Record<string, string | number | boolean>;
  byPlaceholder: Record<string, string | number | boolean>;
};

type SelectorKeys = {
  testIds: string[];
  names: string[];
  ids: string[];
  labels: string[];
  placeholders: string[];
};

const normalizeSelector = (selector: string) =>
  selector.replace(/\\"/g, '"').replace(/\\'/g, "'");

const extractSelectorKeys = (selector: string): SelectorKeys => {
  const normalized = normalizeSelector(selector);
  const keys: SelectorKeys = {
    testIds: [],
    names: [],
    ids: [],
    labels: [],
    placeholders: [],
  };

  const testIdMatch = normalized.match(/getByTestId\(["'](.+?)["']\)/);
  if (testIdMatch?.[1]) {
    keys.testIds.push(testIdMatch[1]);
  }

  const labelMatch = normalized.match(/getByLabel\(["'](.+?)["']\)/);
  if (labelMatch?.[1]) {
    keys.labels.push(labelMatch[1]);
  }

  const placeholderMatch = normalized.match(/getByPlaceholder\(["'](.+?)["']\)/);
  if (placeholderMatch?.[1]) {
    keys.placeholders.push(placeholderMatch[1]);
  }

  const roleNameMatch = normalized.match(
    /getByRole\([^,]+,\s*\{[^}]*name:\s*["'](.+?)["'][^}]*\}\)/,
  );
  if (roleNameMatch?.[1]) {
    keys.labels.push(roleNameMatch[1]);
  }

  const nameMatch = normalized.match(/\[name\s*=\s*["']?([^"'\]]+)["']?\]/);
  if (nameMatch?.[1]) {
    keys.names.push(nameMatch[1]);
  }

  const idMatch = normalized.match(/locator\(["']#([^"']+)["']\)/);
  if (idMatch?.[1]) {
    keys.ids.push(idMatch[1]);
  }

  return keys;
};

const setIfMissing = (
  map: Record<string, string | number | boolean>,
  key: string,
  value: string | number | boolean,
) => {
  if (!key || Object.prototype.hasOwnProperty.call(map, key)) {
    return;
  }
  map[key] = value;
};

export const buildInputTemplate = (steps: Step[]): InputTemplate => {
  const template: InputTemplate = {
    byTestId: {},
    byName: {},
    byId: {},
    byLabel: {},
    byPlaceholder: {},
  };

  for (const step of steps) {
    if (!['INPUT', 'CHANGE'].includes(step.type)) {
      continue;
    }

    const value = step.params?.value;
    if (value === undefined) {
      continue;
    }

    const selectors = [step.selectors.primary, ...step.selectors.fallbacks];
    for (const selector of selectors) {
      const keys = extractSelectorKeys(selector);
      for (const testId of keys.testIds) {
        setIfMissing(template.byTestId, testId, value);
      }
      for (const name of keys.names) {
        setIfMissing(template.byName, name, value);
      }
      for (const id of keys.ids) {
        setIfMissing(template.byId, id, value);
      }
      for (const label of keys.labels) {
        setIfMissing(template.byLabel, label, value);
      }
      for (const placeholder of keys.placeholders) {
        setIfMissing(template.byPlaceholder, placeholder, value);
      }
    }
  }

  return template;
};
