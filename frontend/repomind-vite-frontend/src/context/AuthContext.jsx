import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import {
    loginUser,
    registerUser,
    getCurrentUser,
} from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(
        localStorage.getItem("token")
    );
    const [loading, setLoading] = useState(true);

    // Restore and validate session after page refresh
    useEffect(() => {
        const restoreSession = async () => {
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const userData = await getCurrentUser(token);
                setUser(userData);
            } catch (error) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                setToken(null);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        restoreSession();
    }, [token]);

    // Login
    const login = async (credentials) => {
        const data = await loginUser(credentials);

        if (!data.token) {
            throw new Error("Authentication token not received");
        }

        const userData = {
            id: data.id,
            name: data.name,
            email: data.email,
        };

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(userData));

        setToken(data.token);
        setUser(userData);

        return data;
    };

    // Register
    const register = async (userData) => {
        return await registerUser(userData);
    };

    // Logout
    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                login,
                register,
                logout,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}