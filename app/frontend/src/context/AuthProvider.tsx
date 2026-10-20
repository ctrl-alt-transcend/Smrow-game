import { useState, useEffect, useCallback } from "react";
import { AuthContext } from "./AuthContext";
import { getCurrentUser } from "../services/user.service";
import { registerUser, loginUser } from '../services/auth.service'
import type { LoginPost, RegisterPost, UserPublic } from "../../../shared/types";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<UserPublic | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const bootstrap = async () => {
            const token = localStorage.getItem("access_token");
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const profile = await getCurrentUser();
                setUser(profile);
            } catch {
                localStorage.removeItem("access_token");
            } finally {
                setLoading(false);
            }
        };
        bootstrap();
    }, []);

    const login = useCallback(async (data: LoginPost) => {
        const response = await loginUser(data);
        localStorage.setItem('access_token', response.access_token);
        const profile = await getCurrentUser();
        setUser(profile);
    }, []);

    const register = useCallback(async (data: RegisterPost) => {
        const response = await registerUser(data);
        localStorage.setItem('access_token', response.access_token);
        const profile = await getCurrentUser();
        setUser(profile);
    }, []);

    const logout = useCallback(() => {
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// https://dev.to/miracool/how-to-manage-user-authentication-with-react-js-3ic5