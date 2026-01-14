import { describe, expect, it } from 'vitest';
import { buildEvidenceEvent, buildTargetFingerprint } from '../src/evidence';

const setupDom = () => {
  document.body.innerHTML = `
    <div id="container" data-test="wrap">
      <label for="email">Email Address</label>
      <input id="email" name="email" placeholder="Enter email" />
    </div>
  `;

  return document.getElementById('email') as HTMLInputElement;
};

describe('buildTargetFingerprint', () => {
  it('captures key attributes and selectors', () => {
    const input = setupDom();

    const fingerprint = buildTargetFingerprint(input);

    expect(fingerprint.tagName).toBe('input');
    expect(fingerprint.inputType).toBe('text');
    expect(fingerprint.id).toBe('email');
    expect(fingerprint.name).toBe('email');
    expect(fingerprint.placeholder).toBe('Enter email');
    expect(fingerprint.cssPath).toBe('#email');
  });
});

describe('buildEvidenceEvent', () => {
  it('includes context labels and parent chain', () => {
    const input = setupDom();

    const evidence = buildEvidenceEvent('input', input);

    expect(evidence.context.nearbyLabels).toContain('Email Address');
    expect(evidence.context.parentChain[0]?.tagName).toBe('div');
    expect(evidence.url).toContain('http');
  });
});
