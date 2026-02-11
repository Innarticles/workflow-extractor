import { updateStatus } from './popup-status';
import { EvidenceEvent, RecorderMessage, RecorderStatus } from './types';

const statusElement = document.getElementById('status');
const startButton = document.getElementById('start') as HTMLButtonElement | null;
const stopButton = document.getElementById('stop') as HTMLButtonElement | null;
const exportButton = document.getElementById('export') as HTMLButtonElement | null;
const clearButton = document.getElementById('clear') as HTMLButtonElement | null;

const sendMessage = <T,>(message: RecorderMessage) =>
  new Promise<T>((resolve) => {
    chrome.runtime.sendMessage(message, (response: T) => {
      resolve(response);
    });
  });

const applyStatus = (status: RecorderStatus) => {
  updateStatus(statusElement, status.count);
  if (startButton) {
    startButton.disabled = status.isRecording;
  }
  if (stopButton) {
    stopButton.disabled = !status.isRecording;
  }
};

const refreshStatus = async () => {
  const status = await sendMessage<RecorderStatus>({ type: 'recorder:status' });
  applyStatus(status);
};

startButton?.addEventListener('click', async () => {
  const status = await sendMessage<RecorderStatus>({ type: 'recorder:start' });
  applyStatus(status);
});

stopButton?.addEventListener('click', async () => {
  const status = await sendMessage<RecorderStatus>({ type: 'recorder:stop' });
  applyStatus(status);
});

clearButton?.addEventListener('click', async () => {
  const status = await sendMessage<RecorderStatus>({ type: 'recorder:clear' });
  applyStatus(status);
});

exportButton?.addEventListener('click', async () => {
  const response = await sendMessage<{ events: EvidenceEvent[]; status: RecorderStatus }>({
    type: 'recorder:export',
  });

  applyStatus(response.status);
  const blob = new Blob([JSON.stringify(response.events, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const filename = 'workflow-events.json';

  chrome.downloads.download({ url, filename, saveAs: true }, () => {
    URL.revokeObjectURL(url);
  });
});

void refreshStatus();
