// src/context/AuthProvider.tsx
import { useState, useEffect, useCallback } from "react";
import { AuthContext } from "./AuthContext";
import { LoginPost, RegisterPost, UserPublic } from "../../../shared/types";
import { getCurrentUser } from "../services/user.service";
import { registerUser, loginUser } from '../services/auth.service'

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<UserPublic | null>(null);
    const [loading, setLoading] = useState(true); // true au départ : on vérifie la session


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
                localStorage.removeItem("access_token"); // token invalide/expiré
            } finally {
                setLoading(false);
            }
        };
        bootstrap();
    }, []);

    const login = useCallback(async (data: LoginPost) => {
        await loginUser(data);
        const profile = await getCurrentUser();
        setUser(profile);
    }, []);

    const register = useCallback(async (data: RegisterPost) => {
        await registerUser(data);
        const profile = await getCurrentUser();
        setUser(profile);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem("access_token");
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};