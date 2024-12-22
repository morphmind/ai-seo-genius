import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LoginForm } from './LoginForm';
import { SettingsPasswordForm } from './SettingsPasswordForm';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireSettings?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireSettings = false,
}) => {
  const { isLoggedIn, canAccessSettings } = useAuth();

  if (!isLoggedIn) {
    return <LoginForm />;
  }

  if (requireSettings && !canAccessSettings) {
    return <SettingsPasswordForm />;
  }

  return <>{children}</>;
};
