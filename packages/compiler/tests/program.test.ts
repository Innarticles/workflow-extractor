import { describe, expect, it } from 'vitest';
import { createProgram } from '../src/program';

describe('createProgram', () => {
  it('sets name and description', () => {
    const program = createProgram();

    expect(program.name()).toBe('workflow-extractor');
    expect(program.description()).toBe('Workflow extractor CLI');
  });
});
