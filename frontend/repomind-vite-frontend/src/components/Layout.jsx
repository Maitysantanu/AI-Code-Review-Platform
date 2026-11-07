
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const navItems = [
        { name: "Dashboard", path: "/", icon: "⌂" },
        { name: "Repository Analysis", path: "/repository-analysis", icon: "⌘" },
        { name: "JD Matching", path: "/jd-matching", icon: "◎" },
        { name: "Project Learning", path: "/project-learning", icon: "▤" }
    ];

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    return (
        <div className="app-shell">

            {/* Sidebar */}
            <aside className="sidebar">
                <div className="brand">
                    <h2>RepoMind</h2>
                </div>

                <div className="workspace-label">
                    WORKSPACE
                </div>

                <nav className="nav-list">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === "/"}
                            className={({ isActive }) =>
                                isActive ? "nav-link active" : "nav-link"
                            }
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span>{item.name}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-bottom">
                    <div className="secure-card">
                        <p className="secure-title">Secure Workspace</p>
                        <p className="secure-description">
                            Your repository analysis workspace.
                        </p>
                    </div>

                    <div className="sidebar-user">
                        <div className="user-info">
                            <span className="user-name">
                                {user?.name || user?.email || "User"}
                            </span>
                        </div>

                        <button
                            className="logout-button"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="main-column">
                <header className="topbar">
                    <div className="breadcrumb">
                        RepoMind / Workspace
                    </div>
                </header>

                <main className="main-content">
                    <Outlet />
                </main>

                <footer className="footer">
                    RepoMind — AI-Powered Code Intelligence Platform
                </footer>
            </div>

        </div>
    );
}
