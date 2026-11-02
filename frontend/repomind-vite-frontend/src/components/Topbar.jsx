import { Bell, Search, CircleHelp } from "lucide-react";

export default function Topbar() {
  return (
    <header className="topbar">
      <div className="breadcrumb"><span>Workspace</span><span className="crumb-separator">/</span><strong>Code intelligence</strong></div>
      <div className="topbar-actions">
        <button className="icon-button" aria-label="Search"><Search size={18} /></button>
        <button className="icon-button" aria-label="Help"><CircleHelp size={18} /></button>
        <button className="icon-button" aria-label="Notifications"><Bell size={18} /></button>
        <div className="avatar">SM</div>
      </div>
    </header>
  );
}