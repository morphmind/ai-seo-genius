import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, ArrowLeft, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '../contexts/AuthContext';
import {
  addLoginPassword,
  removeLoginPassword,
  setSettingsPassword,
  getLoginPasswordCount,
  hasSettingsPassword
} from '../utils/passwordStore';

export default function Settings() {
  // API Key visibility states
  const [showOpenAI, setShowOpenAI] = useState(false);
  const [showAnthropic, setShowAnthropic] = useState(false);
  const [showRecraft, setShowRecraft] = useState(false);
  const [showKoala, setShowKoala] = useState(false);

  // Password management states
  const [newLoginPassword, setNewLoginPassword] = useState('');
  const [newSettingsPassword, setNewSettingsPassword] = useState('');
  const [loginPasswordCount, setLoginPasswordCount] = useState(0);
  const [hasSettings, setHasSettings] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        const count = await getLoginPasswordCount();
        const hasSettingsPw = await hasSettingsPassword();
        setLoginPasswordCount(count);
        setHasSettings(hasSettingsPw);
      } catch (error) {
        console.error('Error initializing settings:', error);
        setMessage({ text: 'Error loading settings', type: 'error' });
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const handleAddLoginPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLoginPassword) return;

    try {
      await addLoginPassword(newLoginPassword);
      setNewLoginPassword('');
      setLoginPasswordCount(getLoginPasswordCount());
      setMessage({ text: 'Login password added successfully', type: 'success' });
    } catch (error) {
      setMessage({ text: 'Error adding login password', type: 'error' });
    }
  };

  const handleSetSettingsPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSettingsPassword) return;

    try {
      await setSettingsPassword(newSettingsPassword);
      setNewSettingsPassword('');
      setHasSettings(true);
      setMessage({ text: 'Settings password updated successfully', type: 'success' });
    } catch (error) {
      setMessage({ text: 'Error updating settings password', type: 'error' });
    }
  };

  const handleRemoveLoginPassword = async () => {
    try {
      await removeLoginPassword(loginPasswordCount - 1);
      setLoginPasswordCount(getLoginPasswordCount());
      setMessage({ text: 'Login password removed successfully', type: 'success' });
    } catch (error) {
      setMessage({ text: 'Error removing login password', type: 'error' });
    }
  };

  const handleSave = (type: "openai" | "anthropic" | "recraft" | "koala", value: string) => {
    if (!value.trim()) {
      toast({
        title: "Error",
        description: "API key cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    localStorage.setItem(`${type}_api_key`, value);
    toast({
      title: "Success",
      description: `${type.toUpperCase()} API key saved successfully`,
    });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container max-w-2xl py-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {message && (
        <Alert variant={message.type === 'success' ? 'default' : 'destructive'} className="mb-6">
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {/* Password Management Cards */}
        <Card>
          <CardHeader>
            <CardTitle>Login Passwords</CardTitle>
            <CardDescription>Manage access passwords for the application</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddLoginPassword} className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Input
                    type="password"
                    value={newLoginPassword}
                    onChange={(e) => setNewLoginPassword(e.target.value)}
                    placeholder="New login password"
                  />
                  <Button type="submit" disabled={!newLoginPassword}>
                    Add
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  Active login passwords: {loginPasswordCount}
                </p>
              </div>
            </form>
            
            {loginPasswordCount > 1 && (
              <Button
                variant="destructive"
                className="mt-4"
                onClick={handleRemoveLoginPassword}
              >
                Remove Last Password
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Settings Password</CardTitle>
            <CardDescription>Update the password required to access settings</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSetSettingsPassword} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="password"
                  value={newSettingsPassword}
                  onChange={(e) => setNewSettingsPassword(e.target.value)}
                  placeholder="New settings password"
                />
                <p className="text-sm text-gray-500">
                  Status: {hasSettings ? 'Set' : 'Not Set'}
                </p>
              </div>
              <Button type="submit" disabled={!newSettingsPassword}>
                Update Settings Password
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* API Keys Cards */}
        <Card>
          <CardHeader>
            <CardTitle>OpenAI API Key</CardTitle>
            <CardDescription>
              Enter your OpenAI API key to use the content generation features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Input
                type={showOpenAI ? "text" : "password"}
                placeholder="sk-..."
                defaultValue={localStorage.getItem("openai_api_key") || ""}
                onChange={(e) => handleSave("openai", e.target.value)}
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => setShowOpenAI(!showOpenAI)}
              >
                {showOpenAI ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Anthropic API Key</CardTitle>
            <CardDescription>
              Enter your Anthropic API key for enhanced content generation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Input
                type={showAnthropic ? "text" : "password"}
                placeholder="sk-ant-..."
                defaultValue={localStorage.getItem("anthropic_api_key") || ""}
                onChange={(e) => handleSave("anthropic", e.target.value)}
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => setShowAnthropic(!showAnthropic)}
              >
                {showAnthropic ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recraft.ai API Key</CardTitle>
            <CardDescription>
              Enter your Recraft.ai API key for image generation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Input
                type={showRecraft ? "text" : "password"}
                placeholder="Enter your Recraft.ai API key"
                defaultValue={localStorage.getItem("recraft_api_key") || ""}
                onChange={(e) => handleSave("recraft", e.target.value)}
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => setShowRecraft(!showRecraft)}
              >
                {showRecraft ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Koala.sh API Key</CardTitle>
            <CardDescription>
              Enter your Koala.sh API key for advanced SEO content generation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Input
                type={showKoala ? "text" : "password"}
                placeholder="Enter your Koala.sh API key"
                defaultValue={localStorage.getItem("koala_api_key") || ""}
                onChange={(e) => handleSave("koala", e.target.value)}
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => setShowKoala(!showKoala)}
              >
                {showKoala ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
