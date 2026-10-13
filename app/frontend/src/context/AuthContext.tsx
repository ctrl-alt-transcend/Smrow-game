import { createContext } from "react";
import type { LoginResponse, LoginPost, RegisterPost } from "../../../shared/types";

export interface AuthContextValue {
    user: LoginResponse | null;
    loading: boolean;
    login: (data: LoginPost) => Promise<void>;
    register: (data: RegisterPost) => Promise<void>;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);