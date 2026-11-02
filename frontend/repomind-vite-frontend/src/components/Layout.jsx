import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function Layout() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-column">
        <Topbar />
        <main className="main-content"><Outlet /></main>
        <footer className="footer">RepoMind <span>•</span> AI-powered code intelligence <span className="footer-right">Built for transparent repository insights</span></footer>
      </div>
    </div>
  );
}