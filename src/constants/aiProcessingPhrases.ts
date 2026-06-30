/**
 * Friendly rotating processing phrases for website AI work.
 *
 * Per the PRD, the UI must NOT stream exact model output in V1. Instead it
 * shows predefined, light-hearted status phrases while AI is working.
 * Shared across the creation generation progress and the editor Ask AI / chat.
 */

export const AI_PROCESSING_PHRASES: string[] = [
  "Surfing through your sections",
  "Dunking fresh copy",
  "Spelunking through your site context",
  "Polishing your headlines",
  "Arranging words just so",
  "Consulting the brand muse",
  "Tightening up the details",
  "Sketching out ideas",
  "Brewing something good",
  "Lining up the perfect phrasing",
  "Reading the room",
  "Sprinkling in some personality",
];

/**
 * Hook-free helper that returns a phrase for a given tick index so callers can
 * drive rotation with their own interval/timer.
 */
export function phraseForTick(tick: number): string {
  const list = AI_PROCESSING_PHRASES;
  return list[((tick % list.length) + list.length) % list.length];
}
