import { createContext } from "react";
import type { LoginPost, Register, UserPublic } from "shared";

export interface AuthContextValue {
  user: UserPublic | null;
  loading: boolean;
  authMessage: string | null;
  clearAuthMessage: () => void;
  login: (data: LoginPost) => Promise<void>;
  register: (data: Register) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);
