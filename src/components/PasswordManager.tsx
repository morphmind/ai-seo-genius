import React, { useState } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import {
  addLoginPassword,
  removeLoginPassword,
  setSettingsPassword,
  getLoginPasswords
} from '../utils/passwordStore';

export const PasswordManager: React.FC = () => {
  const [newLoginPassword, setNewLoginPassword] = useState('');
  const [newSettingsPassword, setNewSettingsPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAddLoginPassword = async () => {
    if (newLoginPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setIsLoading(true);
      await addLoginPassword(newLoginPassword);
      setNewLoginPassword('');
      setSuccess('Login password added successfully');
      setError('');
    } catch (error) {
      setError('Failed to add login password');
      console.error('Error adding login password:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSettingsPassword = async () => {
    if (newSettingsPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setIsLoading(true);
      await setSettingsPassword(newSettingsPassword);
      setNewSettingsPassword('');
      setSuccess('Settings password updated successfully');
      setError('');
    } catch (error) {
      setError('Failed to update settings password');
      console.error('Error updating settings password:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveLoginPassword = async (index: number) => {
    try {
      setIsLoading(true);
      await removeLoginPassword(index);
      setSuccess('Login password removed successfully');
      setError('');
    } catch (error) {
      setError('Failed to remove login password');
      console.error('Error removing login password:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get number of stored login passwords
  const loginPasswords = getLoginPasswords();

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Login Passwords</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-4">
            <Input
              type="password"
              value={newLoginPassword}
              onChange={(e) => setNewLoginPassword(e.target.value)}
              placeholder="New login password"
              className="flex-1"
              disabled={isLoading}
            />
            <Button 
              onClick={handleAddLoginPassword}
              disabled={isLoading}
            >
              {isLoading ? 'Adding...' : 'Add Password'}
            </Button>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Existing Login Passwords</h3>
            {loginPasswords.map((_, index) => (
              <div key={index} className="flex justify-between items-center bg-secondary/50 p-2 rounded">
                <span>Password #{index + 1}</span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemoveLoginPassword(index)}
                  disabled={isLoading}
                >
                  {isLoading ? 'Removing...' : 'Remove'}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Settings Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-4">
            <Input
              type="password"
              value={newSettingsPassword}
              onChange={(e) => setNewSettingsPassword(e.target.value)}
              placeholder="New settings password"
              className="flex-1"
              disabled={isLoading}
            />
            <Button 
              onClick={handleUpdateSettingsPassword}
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
