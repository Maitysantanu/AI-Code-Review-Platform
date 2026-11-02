import { NavLink } from "react-router-dom";
import { Activity, BookOpen, Code2, GitBranch, LayoutDashboard, ShieldCheck, Sparkles } from "lucide-react";

const links = [
  { to: "/", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/repository-analysis", label: "Code Analysis", icon: Code2 },
  { to: "/jd-matching", label: "Job Matching", icon: GitBranch },
  { to: "/project-learning", label: "Project Learning", icon: BookOpen }
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark"><Sparkles size={20} /></div>
        <div><strong>RepoMind</strong><span>CODE INTELLIGENCE</span></div>
      </div>
      <div className="workspace-label">WORKSPACE</div>
      <nav className="nav-list">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            <Icon size={18} /><span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="secure-card">
          <div className="secure-icon"><ShieldCheck size={17} /></div>
          <strong>Private by design</strong>
          <p>Repository analysis should use authorized, read-only access.</p>
        </div>
        <div className="sidebar-version"><Activity size={14} /> Platform preview <span>v1.0</span></div>
      </div>
    </aside>
  );
}