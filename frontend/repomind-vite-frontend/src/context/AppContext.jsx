import { createContext, useContext, useMemo, useState } from "react";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [repositoryUrl, setRepositoryUrl] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [matchingResult, setMatchingResult] = useState(null);

  const value = useMemo(() => ({
    repositoryUrl, setRepositoryUrl,
    analysisResult, setAnalysisResult,
    matchingResult, setMatchingResult
  }), [repositoryUrl, analysisResult, matchingResult]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used inside AppProvider");
  return context;
}