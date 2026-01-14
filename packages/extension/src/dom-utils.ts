import { BoundingRect, ParentSnapshot } from './types';

const MAX_TEXT_LENGTH = 80;
const MAX_CLASSES = 5;

const truncateText = (value: string | null, maxLength = MAX_TEXT_LENGTH) => {
  if (!value) {
    return null;
  }

  const trimmed = value.trim().replace(/\s+/g, ' ');
  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxLength)}…`;
};

const getClassList = (element: Element) => Array.from(element.classList).slice(0, MAX_CLASSES);

export const getBoundingRect = (element: Element): BoundingRect => {
  const rect = element.getBoundingClientRect();

  return {
    x: Math.round(rect.x),
    y: Math.round(rect.y),
    width: Math.round(rect.width),
    height: Math.round(rect.height),
  };
};

export const getDataAttributes = (element: Element, limit = 6) => {
  const dataAttributes: Record<string, string> = {};

  Array.from(element.attributes)
    .filter((attr) => attr.name.startsWith('data-'))
    .slice(0, limit)
    .forEach((attr) => {
      dataAttributes[attr.name] = attr.value;
    });

  return dataAttributes;
};

export const getCssPath = (element: Element) => {
  if (!(element instanceof Element)) {
    return null;
  }

  if (element.id) {
    return `#${element.id}`;
  }

  const segments: string[] = [];
  let current: Element | null = element;

  while (current && current.nodeType === Node.ELEMENT_NODE) {
    const tag = current.tagName.toLowerCase();
    if (current.id) {
      segments.unshift(`${tag}#${current.id}`);
      break;
    }

    const parent = current.parentElement;
    if (!parent) {
      segments.unshift(tag);
      break;
    }

    const siblings = Array.from(parent.children).filter(
      (child) => child.tagName.toLowerCase() === tag,
    );
    const index = siblings.indexOf(current) + 1;
    const suffix = siblings.length > 1 ? `:nth-of-type(${index})` : '';
    segments.unshift(`${tag}${suffix}`);
    current = parent;
  }

  return segments.join(' > ');
};

export const getXPath = (element: Element) => {
  const segments: string[] = [];
  let current: Element | null = element;

  while (current && current.nodeType === Node.ELEMENT_NODE) {
    const tag = current.tagName.toLowerCase();
    const parent = current.parentElement;
    if (!parent) {
      segments.unshift(tag);
      break;
    }

    const siblings = Array.from(parent.children).filter(
      (child) => child.tagName.toLowerCase() === tag,
    );
    const index = siblings.indexOf(current) + 1;
    const suffix = siblings.length > 1 ? `[${index}]` : '';
    segments.unshift(`${tag}${suffix}`);
    current = parent;
  }

  return `/${segments.join('/')}`;
};

export const getParentChain = (element: Element, limit = 5): ParentSnapshot[] => {
  const parents: ParentSnapshot[] = [];
  let current = element.parentElement;

  while (current && parents.length < limit) {
    parents.push({
      tagName: current.tagName.toLowerCase(),
      id: current.id || null,
      name: current.getAttribute('name'),
      classList: getClassList(current),
      role: current.getAttribute('role'),
      textSnippet: truncateText(current.textContent),
    });
    current = current.parentElement;
  }

  return parents;
};

export const getNearbyLabels = (element: Element, limit = 3) => {
  const labels = new Set<string>();
  const addLabel = (value: string | null) => {
    const text = truncateText(value, 60);
    if (text) {
      labels.add(text);
    }
  };

  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    element.labels?.forEach((label) => addLabel(label.textContent));
  }

  if (element instanceof HTMLSelectElement) {
    element.labels?.forEach((label) => addLabel(label.textContent));
  }

  const closestLabel = element.closest('label');
  if (closestLabel) {
    addLabel(closestLabel.textContent);
  }

  return Array.from(labels).slice(0, limit);
};

export const getFramePath = () => {
  const segments: string[] = [];
  let current: Window | null = window;

  while (current) {
    if (current === current.top) {
      segments.unshift('top');
      break;
    }

    const frameElement = current.frameElement;
    if (frameElement instanceof HTMLElement) {
      const id = frameElement.id ? `#${frameElement.id}` : '';
      const name = frameElement.getAttribute('name');
      const nameSuffix = name ? `[name="${name}"]` : '';
      segments.unshift(`${frameElement.tagName.toLowerCase()}${id}${nameSuffix}`);
    } else {
      segments.unshift('frame');
    }

    try {
      current = current.parent;
    } catch {
      break;
    }
  }

  return segments.length ? segments : ['top'];
};

export const getElementText = (element: Element) => truncateText(element.textContent);

export const getClassListSnapshot = (element: Element) => getClassList(element);
