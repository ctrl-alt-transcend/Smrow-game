import { useState, useEffect, useCallback } from "react";
import { AuthContext } from "./AuthContext";
import { getCurrentUser } from "../services/user.service";
import { registerUser, loginUser, logoutUser } from "../services/auth.service";
import { authEvents } from "./AuthEvents";
import type { LoginPost, RegisterPost, UserPublic } from "@shared/types";
import { isAxiosError } from "axios";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserPublic | null>(null);
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
          localStorage.removeItem("access_token");
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
    const response = await loginUser(data);
    localStorage.setItem("access_token", response.access_token);
    const profile = await getCurrentUser();
    setUser(profile);
  }, []);

  const register = useCallback(async (data: RegisterPost) => {
    const response = await registerUser(data);
    localStorage.setItem("access_token", response.access_token);
    const profile = await getCurrentUser();
    setUser(profile);
  }, []);

  const logout = useCallback(async (reason?: string) => {
    // Added the 'logoutUser' for google before checking the local user
    // this will remove the cookie from the front without accesing it directly, by calling the back

    try {
      await logoutUser();
      setUser(null);
    } catch (error) {
      console.error("could not logout from server: ", error);
    } finally {
      localStorage.removeItem("access_token");
      setUser(null);
      if (reason) setAuthMessage(reason);
    }
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// https://dev.to/miracool/how-to-manage-user-authentication-with-react-js-3ic5
