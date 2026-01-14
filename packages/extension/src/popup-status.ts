export const updateStatus = (statusElement: HTMLElement | null, count: number) => {
  if (!statusElement) {
    return;
  }

  statusElement.textContent = `Events: ${count}`;
};
