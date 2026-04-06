/**
 * Tests for historySerializer utility (Step 9.8.1)
 *
 * Covers:
 * - compressHistory returns a compressed string smaller than raw JSON
 * - decompressHistory restores the original history array
 * - compressHistory returns null on serialization error
 * - decompressHistory returns null on invalid/corrupted input
 * - Edge cases: empty array, null, undefined
 */
import { describe, it, expect } from 'vitest';
import { compressHistory, decompressHistory } from '../historySerializer';

describe('historySerializer', () => {
  const sampleHistory = [
    { state: { color: '#ffffff', name: 'Home', blocks: [{ id: 1, type: 'hero', content: 'Hello World' }] }, description: 'Initial state', timestamp: 1700000000000 },
    { state: { color: '#000000', name: 'Home', blocks: [{ id: 1, type: 'hero', content: 'Updated' }] }, description: 'Changed color', timestamp: 1700000001000 },
    { state: { color: '#ff0000', name: 'About', blocks: [{ id: 1, type: 'hero', content: 'About Us' }, { id: 2, type: 'text', content: 'We are a company' }] }, description: 'Added block', timestamp: 1700000002000 },
  ];

  // ---------------------------------------------------------------------------
  // compressHistory
  // ---------------------------------------------------------------------------

  it('compressHistory returns a string (not null) for valid history', () => {
    const result = compressHistory(sampleHistory);
    expect(result).not.toBeNull();
    expect(typeof result).toBe('string');
  });

  it('compressHistory output is smaller than raw JSON for non-trivial data', () => {
    const rawJson = JSON.stringify(sampleHistory);
    const compressed = compressHistory(sampleHistory);
    expect(compressed).not.toBeNull();
    // Compressed output should be smaller than raw JSON
    expect(compressed.length).toBeLessThan(rawJson.length);
  });

  it('compressHistory returns null on serialization error (circular ref)', () => {
    const circular = {};
    circular.self = circular;
    const result = compressHistory(circular);
    expect(result).toBeNull();
  });

  it('compressHistory handles empty array', () => {
    const result = compressHistory([]);
    expect(result).not.toBeNull();
    expect(typeof result).toBe('string');
  });

  // ---------------------------------------------------------------------------
  // decompressHistory
  // ---------------------------------------------------------------------------

  it('decompressHistory restores original history array', () => {
    const compressed = compressHistory(sampleHistory);
    const restored = decompressHistory(compressed);
    expect(restored).toEqual(sampleHistory);
  });

  it('decompressHistory returns null on null input', () => {
    const result = decompressHistory(null);
    expect(result).toBeNull();
  });

  it('decompressHistory returns null on undefined input', () => {
    const result = decompressHistory(undefined);
    expect(result).toBeNull();
  });

  it('decompressHistory returns null on corrupted/invalid string', () => {
    const result = decompressHistory('not-valid-compressed-data');
    expect(result).toBeNull();
  });

  it('decompressHistory round-trips empty array correctly', () => {
    const compressed = compressHistory([]);
    const restored = decompressHistory(compressed);
    expect(restored).toEqual([]);
  });

  it('decompressHistory round-trips complex nested state correctly', () => {
    const complexHistory = Array.from({ length: 20 }, (_, i) => ({
      state: {
        blocks: Array.from({ length: 5 }, (_, j) => ({
          id: j,
          type: 'block',
          content: `Content ${i}-${j}`.repeat(10),
          styles: { color: '#ffffff', fontSize: 16, padding: 8 },
        })),
        theme: { primary: '#007bff', secondary: '#6c757d' },
        name: `Page ${i}`,
      },
      description: `Action ${i}`,
      timestamp: 1700000000000 + i * 1000,
    }));

    const compressed = compressHistory(complexHistory);
    const rawJson = JSON.stringify(complexHistory);
    expect(compressed.length).toBeLessThan(rawJson.length);

    const restored = decompressHistory(compressed);
    expect(restored).toEqual(complexHistory);
  });
});
