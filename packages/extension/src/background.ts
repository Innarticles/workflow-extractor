import { EvidenceEvent, RecorderMessage, RecorderStatus } from './types';

const STORAGE_KEY = 'workflow-extractor-events';
const RECORDING_KEY = 'workflow-extractor-recording';

let events: EvidenceEvent[] = [];
let isRecording = false;

const loadState = async () => {
  const stored = await chrome.storage.local.get([STORAGE_KEY, RECORDING_KEY]);
  events = Array.isArray(stored[STORAGE_KEY]) ? stored[STORAGE_KEY] : [];
  isRecording = stored[RECORDING_KEY] === true;
};

const persistState = () =>
  chrome.storage.local.set({
    [STORAGE_KEY]: events,
    [RECORDING_KEY]: isRecording,
  });

const getStatus = (): RecorderStatus => ({
  isRecording,
  count: events.length,
});

void loadState();

chrome.runtime.onInstalled.addListener(() => {
  void loadState();
});

chrome.runtime.onStartup.addListener(() => {
  void loadState();
});

chrome.runtime.onMessage.addListener(
  (message: RecorderMessage, _sender, sendResponse) => {
    const respond = (payload: unknown) => {
      sendResponse(payload);
    };

    switch (message.type) {
      case 'recorder:event': {
        if (isRecording) {
          events.push(message.payload);
          persistState();
        }
        respond(getStatus());
        return true;
      }
      case 'recorder:start': {
        isRecording = true;
        persistState();
        respond(getStatus());
        return true;
      }
      case 'recorder:stop': {
        isRecording = false;
        persistState();
        respond(getStatus());
        return true;
      }
      case 'recorder:clear': {
        events = [];
        persistState();
        respond(getStatus());
        return true;
      }
      case 'recorder:status': {
        respond(getStatus());
        return true;
      }
      case 'recorder:export': {
        respond({ events, status: getStatus() });
        return true;
      }
      default: {
        respond({ error: 'Unknown message' });
        return true;
      }
    }
  },
);
