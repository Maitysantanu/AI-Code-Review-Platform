import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import RepositoryAnalysis from "./pages/RepositoryAnalysis";
import JDMatching from "./pages/JDMatching";
import ProjectLearning from "./pages/ProjectLearning";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/repository-analysis" element={<RepositoryAnalysis />} />
        <Route path="/jd-matching" element={<JDMatching />} />
        <Route path="/project-learning" element={<ProjectLearning />} />
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>
    </Routes>
  );
}