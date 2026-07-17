import { useEffect, useState } from "react";
import type { RefObject } from "react";

type VisibilityOptions = {
  rootMargin?: string;
  threshold?: number;
};

export function useVisibility(
  targetRef: RefObject<Element | null>,
  { rootMargin = "200px 0px", threshold = 0.01 }: VisibilityOptions = {},
) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = targetRef.current;
    if (!element) return;

    if (!("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { root: null, rootMargin, threshold },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [targetRef, rootMargin, threshold]);

  return isVisible;
}
