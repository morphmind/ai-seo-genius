import React, { useState } from 'react';
import { AuthManager } from '../utils/auth';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const PasswordManagement: React.FC = () => {
    const [newLoginPassword, setNewLoginPassword] = useState('');
    const [removeLoginPassword, setRemoveLoginPassword] = useState('');
    const [oldSettingsPassword, setOldSettingsPassword] = useState('');
    const [newSettingsPassword, setNewSettingsPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleAddLoginPassword = (e: React.FormEvent) => {
        e.preventDefault();
        const auth = AuthManager.getInstance();
        auth.addLoginPassword(newLoginPassword);
        setMessage('Login password added successfully');
        setNewLoginPassword('');
    };

    const handleRemoveLoginPassword = (e: React.FormEvent) => {
        e.preventDefault();
        const auth = AuthManager.getInstance();
        if (auth.removeLoginPassword(removeLoginPassword)) {
            setMessage('Login password removed successfully');
        } else {
            setMessage('Password not found');
        }
        setRemoveLoginPassword('');
    };

    const handleChangeSettingsPassword = (e: React.FormEvent) => {
        e.preventDefault();
        const auth = AuthManager.getInstance();
        if (auth.changeSettingsPassword(oldSettingsPassword, newSettingsPassword)) {
            setMessage('Settings password changed successfully');
            setOldSettingsPassword('');
            setNewSettingsPassword('');
        } else {
            setMessage('Invalid current settings password');
        }
    };

    return (
        <Card className="w-[400px] mx-auto mt-4">
            <CardHeader>
                <CardTitle>Password Management</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="login">
                    <TabsList className="w-full">
                        <TabsTrigger value="login" className="w-1/2">Login Passwords</TabsTrigger>
                        <TabsTrigger value="settings" className="w-1/2">Settings Password</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="login">
                        <div className="space-y-4">
                            <form onSubmit={handleAddLoginPassword}>
                                <div className="space-y-2">
                                    <Input
                                        type="password"
                                        value={newLoginPassword}
                                        onChange={(e) => setNewLoginPassword(e.target.value)}
                                        placeholder="New login password"
                                        required
                                    />
                                    <Button type="submit" className="w-full">Add Login Password</Button>
                                </div>
                            </form>

                            <form onSubmit={handleRemoveLoginPassword}>
                                <div className="space-y-2">
                                    <Input
                                        type="password"
                                        value={removeLoginPassword}
                                        onChange={(e) => setRemoveLoginPassword(e.target.value)}
                                        placeholder="Password to remove"
                                        required
                                    />
                                    <Button type="submit" variant="destructive" className="w-full">
                                        Remove Login Password
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </TabsContent>

                    <TabsContent value="settings">
                        <form onSubmit={handleChangeSettingsPassword}>
                            <div className="space-y-2">
                                <Input
                                    type="password"
                                    value={oldSettingsPassword}
                                    onChange={(e) => setOldSettingsPassword(e.target.value)}
                                    placeholder="Current settings password"
                                    required
                                />
                                <Input
                                    type="password"
                                    value={newSettingsPassword}
                                    onChange={(e) => setNewSettingsPassword(e.target.value)}
                                    placeholder="New settings password"
                                    required
                                />
                                <Button type="submit" className="w-full">
                                    Change Settings Password
                                </Button>
                            </div>
                        </form>
                    </TabsContent>
                </Tabs>

                {message && (
                    <p className="mt-4 text-sm text-center text-green-600">{message}</p>
                )}
            </CardContent>
        </Card>
    );
};
