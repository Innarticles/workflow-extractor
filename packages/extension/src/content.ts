import { buildEvidenceEvent } from './evidence';
import { EvidenceEventType, RecorderMessage } from './types';

const sendEvent = (eventType: EvidenceEventType, target: Element | null) => {
  const message: RecorderMessage = {
    type: 'recorder:event',
    payload: buildEvidenceEvent(eventType, target),
  };

  chrome.runtime.sendMessage(message);
};

const handleEvent = (eventType: EvidenceEventType) => (event: Event) => {
  const target = event.target instanceof Element ? event.target : null;
  sendEvent(eventType, target);
};

document.addEventListener('click', handleEvent('click'), true);
document.addEventListener('input', handleEvent('input'), true);
document.addEventListener('change', handleEvent('change'), true);
document.addEventListener(
  'keydown',
  (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      const target = event.target instanceof Element ? event.target : null;
      sendEvent('keydown', target);
    }
  },
  true,
);
document.addEventListener('submit', handleEvent('submit'), true);
document.addEventListener('focus', handleEvent('focus'), true);

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
