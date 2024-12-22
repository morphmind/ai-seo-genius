import React, { createContext, useContext, useState, useEffect } from 'react';
import { validateLoginPassword, validateSettingsPassword, initializePasswords } from '../utils/passwordStore';
import { secureStorage } from '../utils/secureStorage';

interface AuthContextType {
  isLoggedIn: boolean;
  canAccessSettings: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  validateSettingsAccess: (password: string) => Promise<boolean>;
  clearSettingsAccess: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Session storage keys
const LOGIN_SESSION_KEY = 'auth_session_login';
const SETTINGS_SESSION_KEY = 'auth_session_settings';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    // Initialize from session storage
    return sessionStorage.getItem(LOGIN_SESSION_KEY) === 'true';
  });
  
  const [canAccessSettings, setCanAccessSettings] = useState<boolean>(() => {
    // Initialize from session storage
    return sessionStorage.getItem(SETTINGS_SESSION_KEY) === 'true';
  });
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        await secureStorage.init(); // Önce secure storage'ı başlat
        await initializePasswords(); // Sonra şifreleri yükle
      } catch (error) {
        console.error('Error initializing:', error);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  // Update session storage when auth states change
  useEffect(() => {
    if (isLoggedIn) {
      sessionStorage.setItem(LOGIN_SESSION_KEY, 'true');
    } else {
      sessionStorage.removeItem(LOGIN_SESSION_KEY);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (canAccessSettings) {
      sessionStorage.setItem(SETTINGS_SESSION_KEY, 'true');
    } else {
      sessionStorage.removeItem(SETTINGS_SESSION_KEY);
    }
  }, [canAccessSettings]);

  const login = async (password: string): Promise<boolean> => {
    try {
      const isValid = await validateLoginPassword(password);
      if (isValid) {
        setIsLoggedIn(true);
      }
      return isValid;
    } catch (error) {
      console.error('Error during login:', error);
      return false;
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setCanAccessSettings(false);
    sessionStorage.removeItem(LOGIN_SESSION_KEY);
    sessionStorage.removeItem(SETTINGS_SESSION_KEY);
  };

  const validateSettingsAccess = async (password: string): Promise<boolean> => {
    try {
      const isValid = await validateSettingsPassword(password);
      if (isValid) {
        setCanAccessSettings(true);
      }
      return isValid;
    } catch (error) {
      console.error('Error validating settings access:', error);
      return false;
    }
  };

  const clearSettingsAccess = () => {
    setCanAccessSettings(false);
    sessionStorage.removeItem(SETTINGS_SESSION_KEY);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        canAccessSettings,
        login,
        logout,
        validateSettingsAccess,
        clearSettingsAccess,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
