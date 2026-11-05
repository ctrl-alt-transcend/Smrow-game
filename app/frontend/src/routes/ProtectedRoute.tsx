import { useEffect } from "react";
import { Navigate, Outlet } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { Loader } from "@mantine/core";
import { socialSocket } from "../sockets/socialSocket";

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const userId = user?.id;

  useEffect(() => {
    if (!userId)
      return;
    socialSocket.connect();
    return () => { socialSocket.disconnect(); };
  }, [userId]);

  if (loading) return <Loader />;
  if (!user) return <Navigate to="/" replace />;

  return <Outlet />;
}
