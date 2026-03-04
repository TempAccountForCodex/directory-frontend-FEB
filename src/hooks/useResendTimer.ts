import { useState, useEffect } from "react";

/**
 * Hook to manage a countdown timer for resend code functionality
 * @param initialSeconds - Initial countdown value (default: 60)
 * @returns Object with secondsRemaining, start, and reset functions
 */
export function useResendTimer(initialSeconds: number = 60) {
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  useEffect(() => {
    if (secondsRemaining > 0) {
      const timer = setTimeout(() => {
        setSecondsRemaining(secondsRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [secondsRemaining]);

  const start = (seconds: number = initialSeconds) => {
    setSecondsRemaining(seconds);
  };

  const reset = (seconds: number = initialSeconds) => {
    setSecondsRemaining(seconds);
  };

  return {
    secondsRemaining,
    start,
    reset,
  };
}
