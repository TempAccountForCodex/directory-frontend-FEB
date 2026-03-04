import React, {
  createContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

/* ---------------- Types ---------------- */
interface DashboardContextType {
  selectedSection: string;
  setSelectedSection: React.Dispatch<React.SetStateAction<string>>;
  user: string | null;
  setUser: React.Dispatch<React.SetStateAction<string | null>>;
}

interface DashboardProviderProps {
  children: ReactNode;
}

/* ---------------- Context ---------------- */
const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined,
);

const DashboardProvider: React.FC<DashboardProviderProps> = ({ children }) => {
  const [selectedSection, setSelectedSection] = useState<string>(
    "/dashboard/createuser",
  );
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      const userName = localStorage.getItem("userName");
      if (userName) setUser(userName);
    }
  }, [user]);

  return (
    <DashboardContext.Provider
      value={{ selectedSection, setSelectedSection, user, setUser }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export { DashboardContext, DashboardProvider };
