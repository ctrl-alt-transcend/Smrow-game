import { useState, useEffect, useCallback } from "react";
import { AuthContext } from "./AuthContext";
import { getCurrentUser } from "../services/user.service";
import { registerUser, loginUser, logoutUser } from "../services/auth.service";
import { authEvents } from "./AuthEvents";
import type { LoginPost, RegisterPost, UserProfile } from "shared";
import { isAxiosError } from "axios";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authMessage, setAuthMessage] = useState<string | null>(null);

  useEffect(() => {
    const bootstrap = async () => {
      // As we use cookies, we cannot check for localStorage to verify a user, this check becomes useless, we will check with the back constantly

      //  const token = localStorage.getItem("access_token");
      //  if (!token) {
      //    setLoading(false);
      //    return;
      //  }

      try {
        const profile = await getCurrentUser();
        setUser(profile);
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 401) {
          setAuthMessage("Your session has expired.");
        } else {
          console.error("Could not restore session:", error);
        }
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  const login = useCallback(async (data: LoginPost) => {
    await loginUser(data);
    setUser(await getCurrentUser());
  }, []);

  const register = useCallback(async (data: RegisterPost) => {
    await registerUser(data);
    setUser(await getCurrentUser());
  }, []);

  const logout = useCallback(async (reason?: string) => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("could not logout from server: ", error);
    } finally {
      setUser(null);
      if (reason) setAuthMessage(reason);
    }
  }, []);

  const updateUser = useCallback((patch: Partial<UserProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const clearAuthMessage = useCallback(() => setAuthMessage(null), []);

  useEffect(() => {
    const handler = (e: Event) => {
      const reason = (e as CustomEvent).detail;
      logout(reason);
    };
    authEvents.addEventListener("logout", handler);
    return () => authEvents.removeEventListener("logout", handler);
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        authMessage,
        clearAuthMessage,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// https://dev.to/miracool/how-to-manage-user-authentication-with-react-js-3ic5
