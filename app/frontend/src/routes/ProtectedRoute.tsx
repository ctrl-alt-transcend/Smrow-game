import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import { Loader } from '@mantine/core';

export function ProtectedRoute() {
  const { user, loading } = useAuth();

    if (loading) return <Loader />;
    if (!user)   return <Navigate to="/" replace />;

  return <Outlet />;
}