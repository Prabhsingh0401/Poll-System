import { useState, useEffect, useCallback } from "react";

/* -------------------- Types -------------------- */

type PollTime = number | null;

/* -------------------- Hook -------------------- */

export const usePollTimer = (initialTime: PollTime = null) => {
  const [remainingTime, setRemainingTime] = useState<PollTime>(initialTime);

  useEffect(() => {
    // Timer is driven by server updates
    // No local countdown logic here
    return () => {};
  }, [remainingTime]);

  const resetTimer = useCallback((time: number): void => {
    setRemainingTime(time);
  }, []);

  const clearTimer = useCallback((): void => {
    setRemainingTime(null);
  }, []);

  return {
    remainingTime,
    setRemainingTime,
    resetTimer,
    clearTimer,
  };
};
