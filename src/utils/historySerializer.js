/**
 * historySerializer — LZ-string compression utility for undo/redo history (Step 9.8.1)
 *
 * Provides compress/decompress functions using lz-string compressToUTF16/decompressFromUTF16.
 * Expected size reduction: ~60-70% for typical editor state history.
 *
 * Both functions have try/catch with graceful fallback (null on error).
 */

import LZString from 'lz-string';

/**
 * Compress a history array to a UTF-16 encoded string for sessionStorage.
 *
 * @param {Array} history - Array of HistorySnapshot objects to compress.
 * @returns {string|null} Compressed string, or null on error.
 */
export function compressHistory(history) {
  try {
    const json = JSON.stringify(history);
    const compressed = LZString.compressToUTF16(json);
    return compressed;
  } catch {
    return null;
  }
}

/**
 * Decompress a UTF-16 encoded string back to a history array.
 *
 * @param {string|null|undefined} stored - Compressed string from sessionStorage.
 * @returns {Array|null} Restored history array, or null on error/invalid input.
 */
export function decompressHistory(stored) {
  if (stored === null || stored === undefined) {
    return null;
  }
  try {
    const json = LZString.decompressFromUTF16(stored);
    if (json === null || json === undefined) {
      return null;
    }
    const parsed = JSON.parse(json);
    return parsed;
  } catch {
    return null;
  }
}
