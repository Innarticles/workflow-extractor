import { EvidenceEvent } from './types.js';
import { SelectorBundle } from './flow-types.js';

const buildStringLiteral = (value: string) => JSON.stringify(value);

const unique = (values: string[]) => Array.from(new Set(values));

const buildTestSelectors = (dataAttributes: Record<string, string>) => {
  const candidates: string[] = [];
  const testId = dataAttributes['data-testid'];
  const dataTest = dataAttributes['data-test'];
  const dataCy = dataAttributes['data-cy'];

  if (testId) {
    candidates.push(`getByTestId(${buildStringLiteral(testId)})`);
  }
  if (dataTest) {
    candidates.push(`locator(${buildStringLiteral(`[data-test="${dataTest}"]`)})`);
  }
  if (dataCy) {
    candidates.push(`locator(${buildStringLiteral(`[data-cy="${dataCy}"]`)})`);
  }

  return candidates;
};

const resolveRole = (event: EvidenceEvent) => {
  const role = event.target?.role;
  if (role) {
    return role;
  }

  const tag = event.target?.tagName;
  if (!tag) {
    return null;
  }

  if (tag === 'button') {
    return 'button';
  }
  if (tag === 'a') {
    return 'link';
  }
  if (tag === 'input' && event.target?.inputType === 'checkbox') {
    return 'checkbox';
  }

  return null;
};

const resolveAccessibleName = (event: EvidenceEvent) =>
  event.target?.ariaLabel || event.target?.innerText || event.context.nearbyLabels[0] || null;

export const buildSelectorBundle = (event: EvidenceEvent): SelectorBundle => {
  const target = event.target;
  if (!target) {
    return { primary: 'page', fallbacks: [] };
  }

  const candidates: string[] = [];
  candidates.push(...buildTestSelectors(target.dataAttributes));

  const role = resolveRole(event);
  const name = resolveAccessibleName(event);
  if (role && name) {
    candidates.push(
      `getByRole(${buildStringLiteral(role)}, { name: ${buildStringLiteral(name)} })`,
    );
  }

  if (event.context.nearbyLabels[0]) {
    candidates.push(`getByLabel(${buildStringLiteral(event.context.nearbyLabels[0])})`);
  }

  if (target.placeholder) {
    candidates.push(`getByPlaceholder(${buildStringLiteral(target.placeholder)})`);
  }

  if (target.id) {
    candidates.push(`locator(${buildStringLiteral(`#${target.id}`)})`);
  }

  if (target.name) {
    candidates.push(`locator(${buildStringLiteral(`[name="${target.name}"]`)})`);
  }

  if (target.innerText) {
    candidates.push(`getByText(${buildStringLiteral(target.innerText)})`);
  }

  if (target.cssPath) {
    candidates.push(`locator(${buildStringLiteral(target.cssPath)})`);
  }

  if (target.xpath) {
    candidates.push(`locator(${buildStringLiteral(`xpath=${target.xpath}`)})`);
  }

  const uniqueCandidates = unique(candidates);

  return {
    primary: uniqueCandidates[0] ?? 'page',
    fallbacks: uniqueCandidates.slice(1),
  };
};
