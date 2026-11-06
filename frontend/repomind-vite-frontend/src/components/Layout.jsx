
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    const navItems = [
        { name: "Dashboard", path: "/" },
        { name: "Repository Analysis", path: "/repository-analysis" },
        { name: "JD Matching", path: "/jd-matching" },
        { name: "Project Learning", path: "/project-learning" }
    ];

    return (
        <div className="app-layout">

            {/* Navbar */}
            <header className="navbar">

                <div className="navbar-brand">
                    <h2>RepoMind</h2>
                </div>

                <nav className="navbar-links">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === "/"}
                            className={({ isActive }) =>
                                isActive ? "nav-link active" : "nav-link"
                            }
                        >
                            {item.name}
                        </NavLink>
                    ))}
                </nav>

                <div className="navbar-user">

                    <span className="user-name">
                        {user?.name || user?.email}
                    </span>

                    <button
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </div>

            </header>

            {/* Main page content */}
            <main className="main-content">
                <Outlet />
            </main>

        </div>
    );
}
