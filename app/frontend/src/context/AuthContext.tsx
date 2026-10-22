import { createContext } from "react";
import type { LoginPost, RegisterPost, UserPublic } from "@shared/types";

export interface AuthContextValue {
    user: UserPublic | null;
    loading: boolean;
    login: (data: LoginPost) => Promise<void>;
    register: (data: RegisterPost) => Promise<void>;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
