const API_URL =
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:8080/api";

export async function registerUser(userData) {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || "Registration failed");
    }

    return data;
}

export async function loginUser(credentials) {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || "Invalid email or password");
    }

    return data;
}

export async function getCurrentUser(token) {
    const response = await fetch(`${API_URL}/auth/me`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Session expired");
    }

    return response.json();
}