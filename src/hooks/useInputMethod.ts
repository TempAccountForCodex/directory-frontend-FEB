/**
 * useInputMethod — Step 9.11.1
 *
 * Detects the current input method (touch, mouse, keyboard) by listening
 * to touchstart, mousemove, and keydown events on the window.
 *
 * Keyboard mode activates only when no touch event has occurred in the
 * last 5 seconds and a keydown event is received. This prevents false
 * keyboard detection on tablets during brief keyboard use while primarily
 * using touch.
 *
 * Supports a forced keyboard navigation mode that persists to localStorage
 * for users who always want keyboard-style focus indicators.
 *
 * Manages a 'keyboard-active' CSS class on document.body so global styles
 * can conditionally show focus outlines.
 */
import { useState, useEffect, useCallback, useRef } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type InputMethod = "touch" | "mouse" | "keyboard";

export interface UseInputMethodReturn {
  /** Current detected input method */
  inputMethod: InputMethod;
  /** True when keyboard is the active input method (detected or forced) */
  isKeyboardMode: boolean;
  /** True when the user has manually forced keyboard navigation mode */
  forceKeyboardMode: boolean;
  /** Persist forced keyboard mode to localStorage and update state */
  setForceKeyboardMode: (value: boolean) => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TOUCH_TIMEOUT_MS = 5000;
const STORAGE_KEY = "keyboardNavigationMode";
const BODY_CLASS = "keyboard-active";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const readStoredPreference = (): boolean => {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useInputMethod(): UseInputMethodReturn {
  const [inputMethod, setInputMethod] = useState<InputMethod>("mouse");
  const [forceKeyboardMode, setForceKeyboardModeState] =
    useState<boolean>(readStoredPreference);

  // Track last touch timestamp via ref to avoid re-registering listeners
  const lastTouchRef = useRef<number>(0);

  // Derived: keyboard mode is active if detected keyboard OR forced
  const isKeyboardMode = forceKeyboardMode || inputMethod === "keyboard";

  // -------------------------------------------------------------------------
  // Body class management
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (isKeyboardMode) {
      document.body.classList.add(BODY_CLASS);
    } else {
      document.body.classList.remove(BODY_CLASS);
    }
    return () => {
      document.body.classList.remove(BODY_CLASS);
    };
  }, [isKeyboardMode]);

  // -------------------------------------------------------------------------
  // Event listeners for input method detection
  // -------------------------------------------------------------------------
  useEffect(() => {
    const handleTouchStart = () => {
      lastTouchRef.current = Date.now();
      setInputMethod("touch");
    };

    const handleMouseMove = () => {
      const timeSinceTouch = Date.now() - lastTouchRef.current;
      // Only switch to mouse if enough time passed since last touch
      // (mouse events can fire after touch on some devices)
      if (timeSinceTouch > TOUCH_TIMEOUT_MS) {
        setInputMethod("mouse");
      }
    };

    const handleKeyDown = () => {
      const timeSinceTouch = Date.now() - lastTouchRef.current;
      if (timeSinceTouch > TOUCH_TIMEOUT_MS) {
        setInputMethod("keyboard");
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("keydown", handleKeyDown, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // -------------------------------------------------------------------------
  // Force keyboard mode (localStorage-persisted)
  // -------------------------------------------------------------------------
  const setForceKeyboardMode = useCallback((value: boolean) => {
    setForceKeyboardModeState(value);
    try {
      localStorage.setItem(STORAGE_KEY, String(value));
    } catch {
      // localStorage may be unavailable in some environments
    }
  }, []);

  return {
    inputMethod,
    isKeyboardMode,
    forceKeyboardMode,
    setForceKeyboardMode,
  };
}
