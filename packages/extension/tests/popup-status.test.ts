import { describe, expect, it } from 'vitest';
import { updateStatus } from '../src/popup-status';

describe('updateStatus', () => {
  it('updates text when element exists', () => {
    const element = document.createElement('div');

    updateStatus(element, 3);

    expect(element.textContent).toBe('Events: 3');
  });

  it('handles null element', () => {
    expect(() => updateStatus(null, 2)).not.toThrow();
  });
});
