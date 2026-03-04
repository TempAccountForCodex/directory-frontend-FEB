import React, { createContext, useState, type ReactNode } from "react";

/* ---------------- Types ---------------- */
interface PendingCounterContextType {
  counter: number;
  setCounter: React.Dispatch<React.SetStateAction<number>>;
}

interface PendingCounterProviderProps {
  children: ReactNode;
}

/* ---------------- Context ---------------- */
export const PendingCounterContext = createContext<
  PendingCounterContextType | undefined
>(undefined);

export const PendingCounterProvider: React.FC<PendingCounterProviderProps> = ({
  children,
}) => {
  const [counter, setCounter] = useState<number>(0);

  return (
    <PendingCounterContext.Provider value={{ counter, setCounter }}>
      {children}
    </PendingCounterContext.Provider>
  );
};
