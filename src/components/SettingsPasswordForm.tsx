import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";

export const SettingsPasswordForm: React.FC = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { validateSettingsAccess } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const isValid = await validateSettingsAccess(password);
      if (!isValid) {
        setError('Invalid settings password');
        setPassword('');
      }
    } catch (error) {
      setError('An error occurred while validating settings access');
      console.error('Settings validation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-center">Settings Access</h2>
          <p className="text-gray-500 text-center">Please enter the settings password</p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter settings password"
            className="w-full"
            disabled={isLoading}
          />

          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Validating...' : 'Access Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
};
