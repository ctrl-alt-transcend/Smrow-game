import { createContext } from "react";
import type { LoginPost, RegisterPost, UserProfile } from "shared";

export interface AuthContextValue {
  user: UserProfile | null;
  loading: boolean;
  authMessage: string | null;
  clearAuthMessage: () => void;
  login: (data: LoginPost) => Promise<void>;
  register: (data: RegisterPost) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);
