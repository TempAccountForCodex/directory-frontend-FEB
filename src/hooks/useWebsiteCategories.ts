/**
 * useWebsiteCategories — loads website/business categories (template-used +
 * user-created) and supports adding a new one during website creation.
 *
 * Contract: GET/POST /api/website-categories (PRD "List/Add Website Categories").
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  listWebsiteCategories,
  addWebsiteCategory,
  normalizeWebsiteAIError,
  WebsiteAIRequestError,
  type WebsiteCategory,
} from "../api/websiteAI";

export interface UseWebsiteCategories {
  categories: WebsiteCategory[];
  loading: boolean;
  error: string | null;
  /** Create a new user category and return it (also added to local list). */
  addCategory: (label: string) => Promise<WebsiteCategory | null>;
  adding: boolean;
  reload: () => void;
}

export function useWebsiteCategories(enabled = true): UseWebsiteCategories {
  const [categories, setCategories] = useState<WebsiteCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(() => {
    if (!enabled) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);
    listWebsiteCategories(controller.signal)
      .then((cats) => setCategories(cats))
      .catch((err) => {
        if (controller.signal.aborted) return;
        // Categories endpoint may not be deployed yet — degrade gracefully.
        setError(normalizeWebsiteAIError(err).message);
        setCategories([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
  }, [enabled]);

  useEffect(() => {
    load();
    return () => abortRef.current?.abort();
  }, [load]);

  const addCategory = useCallback(
    async (label: string): Promise<WebsiteCategory | null> => {
      const trimmed = label.trim();
      if (!trimmed) return null;
      setAdding(true);
      setError(null);
      try {
        const created = await addWebsiteCategory(trimmed);
        setCategories((prev) => {
          if (prev.some((c) => c.value === created.value)) return prev;
          return [...prev, created];
        });
        return created;
      } catch (err) {
        const aiErr =
          err instanceof WebsiteAIRequestError
            ? err.aiError
            : normalizeWebsiteAIError(err);
        setError(aiErr.message);
        return null;
      } finally {
        setAdding(false);
      }
    },
    [],
  );

  return { categories, loading, error, addCategory, adding, reload: load };
}
