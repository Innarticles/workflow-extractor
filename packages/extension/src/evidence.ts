import {
  ContextSnapshot,
  EvidenceEvent,
  EvidenceEventType,
  TargetFingerprint,
} from './types';
import {
  getBoundingRect,
  getClassListSnapshot,
  getCssPath,
  getDataAttributes,
  getElementText,
  getFramePath,
  getNearbyLabels,
  getParentChain,
  getXPath,
} from './dom-utils';

const toNullable = (value: string | null | undefined) => value ?? null;

export const buildTargetFingerprint = (element: Element): TargetFingerprint => {
  const htmlElement = element as HTMLElement;
  const inputType = element instanceof HTMLInputElement
    ? element.type
    : element instanceof HTMLTextAreaElement
      ? 'textarea'
      : null;
  const value =
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement ||
    element instanceof HTMLSelectElement
      ? element.value
      : null;

  return {
    tagName: element.tagName.toLowerCase(),
    inputType,
    id: htmlElement.id || null,
    name: toNullable(htmlElement.getAttribute('name')),
    classList: getClassListSnapshot(element),
    dataAttributes: getDataAttributes(element),
    ariaLabel: toNullable(htmlElement.getAttribute('aria-label')),
    ariaLabelledby: toNullable(htmlElement.getAttribute('aria-labelledby')),
    role: toNullable(htmlElement.getAttribute('role')),
    placeholder: toNullable(htmlElement.getAttribute('placeholder')),
    title: toNullable(htmlElement.getAttribute('title')),
    innerText: getElementText(element),
    value,
    boundingClientRect: getBoundingRect(element),
    cssPath: getCssPath(element),
    xpath: getXPath(element),
  };
};

export const buildContextSnapshot = (element: Element | null): ContextSnapshot => {
  if (!element) {
    return { parentChain: [], nearbyLabels: [] };
  }

  return {
    parentChain: getParentChain(element, 5),
    nearbyLabels: getNearbyLabels(element, 3),
  };
};

export const buildEvidenceEvent = (
  eventType: EvidenceEventType,
  element: Element | null,
): EvidenceEvent => {
  return {
    eventType,
    timestamp: Date.now(),
    url: window.location.href,
    framePath: getFramePath(),
    target: element ? buildTargetFingerprint(element) : null,
    context: buildContextSnapshot(element),
  };
};
