import { buildEvidenceEvent } from './evidence';
import { EvidenceEventType, RecorderMessage } from './types';

const sendEvent = (eventType: EvidenceEventType, target: Element | null) => {
  const message: RecorderMessage = {
    type: 'recorder:event',
    payload: buildEvidenceEvent(eventType, target),
  };

  chrome.runtime.sendMessage(message);
};

const getEventTarget = (event: Event) =>
  event.target instanceof Element ? event.target : null;

const isEditableElement = (element: Element) =>
  element instanceof HTMLInputElement ||
  element instanceof HTMLTextAreaElement ||
  element instanceof HTMLSelectElement ||
  element.isContentEditable;

const handleEvent = (eventType: EvidenceEventType) => (event: Event) => {
  const target = getEventTarget(event);
  sendEvent(eventType, target);
};

document.addEventListener('click', handleEvent('click'), true);
document.addEventListener(
  'input',
  (event: Event) => {
    const target = getEventTarget(event);
    if (!target || !isEditableElement(target)) {
      return;
    }
    sendEvent('input', target);
  },
  true,
);
document.addEventListener(
  'change',
  (event: Event) => {
    const target = getEventTarget(event);
    if (!target || !isEditableElement(target)) {
      return;
    }
    sendEvent('change', target);
  },
  true,
);
document.addEventListener(
  'keydown',
  (event: KeyboardEvent) => {
    if (event.key !== 'Enter') {
      return;
    }
    const target = getEventTarget(event);
    if (!target || !isEditableElement(target)) {
      return;
    }
    sendEvent('keydown', target);
  },
  true,
);
document.addEventListener('submit', handleEvent('submit'), true);

const emitNavigation = () => sendEvent('navigate', null);

window.addEventListener('popstate', emitNavigation);
window.addEventListener('hashchange', emitNavigation);

let lastUrl = window.location.href;
setInterval(() => {
  if (window.location.href !== lastUrl) {
    lastUrl = window.location.href;
    emitNavigation();
  }
}, 1000);
