import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [repositoryUrl, setRepositoryUrl] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [matchingResult, setMatchingResult] = useState(null);
  const [analyzedRepositories, setAnalyzedRepositories] = useState([]);

  // Count each repository once during the current app session.
  // This state is intentionally not persisted, so it resets on refresh.
  const registerAnalyzedRepository = useCallback((url) => {
    const normalizedUrl = String(url ?? "")
      .trim()
      .replace(/\/+$/, "")
      .toLowerCase();

    if (!normalizedUrl) return;

    setAnalyzedRepositories((previous) =>
      previous.includes(normalizedUrl)
        ? previous
        : [...previous, normalizedUrl]
    );
  }, []);

  const value = useMemo(
    () => ({
      repositoryUrl,
      setRepositoryUrl,
      analysisResult,
      setAnalysisResult,
      matchingResult,
      setMatchingResult,
      analyzedRepositories,
      registerAnalyzedRepository,
    }),
    [
      repositoryUrl,
      analysisResult,
      matchingResult,
      analyzedRepositories,
      registerAnalyzedRepository,
    ]
  );

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useApp must be used inside AppProvider");
  }

  return context;
}
