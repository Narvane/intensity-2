import { describe, expect, it } from 'vitest';
import { BOX_TYPES, DEFAULT_BOX_TYPE } from '@domain/box/boxTypes';

describe('boxTypes', () => {
  it('defaults to SAIDAS_COM_AMIGOS', () => {
    expect(DEFAULT_BOX_TYPE).toBe('SAIDAS_COM_AMIGOS');
  });

  it('lists eleven box types', () => {
    expect(BOX_TYPES).toHaveLength(11);
    expect(BOX_TYPES).toContain('EXPERIENCIAS_DIFERENTES');
  });
});
