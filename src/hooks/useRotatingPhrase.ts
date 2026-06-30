/**
 * useRotatingPhrase — rotates through friendly AI processing phrases on a timer.
 * Used while website AI is working (creation generation, Ask AI, chat).
 */

import { useEffect, useState } from "react";
import {
  AI_PROCESSING_PHRASES,
  phraseForTick,
} from "../constants/aiProcessingPhrases";

export function useRotatingPhrase(active: boolean, intervalMs = 2200): string {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setTick((t) => t + 1), intervalMs);
    return () => clearInterval(id);
  }, [active, intervalMs]);

  return phraseForTick(tick);
}

export { AI_PROCESSING_PHRASES };
