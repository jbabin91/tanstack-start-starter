import { describe, expect, it, vi } from 'vitest';

describe('nanoid utility', () => {
  it('should generate a string ID', async () => {
    // Use actual implementation for this test
    vi.doUnmock('./nanoid');
    const { nanoid } = await import('./nanoid');
    const id = nanoid();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('should generate unique IDs', async () => {
    // Use actual implementation for this test
    vi.doUnmock('./nanoid');
    const { nanoid } = await import('./nanoid');
    const id1 = nanoid();
    const id2 = nanoid();
    expect(id1).not.toBe(id2);
  });

  it('should only contain allowed characters', async () => {
    // Use actual implementation for this test
    vi.doUnmock('./nanoid');
    const { nanoid } = await import('./nanoid');
    const id = nanoid();
    // Custom alphabet from actual implementation: ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789
    const allowedChars =
      /^[ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789]+$/;
    expect(id).toMatch(allowedChars);
  });
});
