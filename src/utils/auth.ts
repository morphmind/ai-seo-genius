import { createHash } from 'crypto';

interface StoredPasswords {
    loginPasswords: string[];
    settingsPassword: string;
}

class AuthManager {
    private static instance: AuthManager;
    private passwords: StoredPasswords;

    private constructor() {
        // Initialize with default passwords from environment or config
        this.passwords = {
            loginPasswords: [],
            settingsPassword: ''
        };
        this.loadPasswords();
    }

    public static getInstance(): AuthManager {
        if (!AuthManager.instance) {
            AuthManager.instance = new AuthManager();
        }
        return AuthManager.instance;
    }

    private hashPassword(password: string): string {
        return createHash('sha256').update(password).digest('hex');
    }

    private loadPasswords() {
        try {
            const storedPasswords = localStorage.getItem('secure_passwords');
            if (storedPasswords) {
                this.passwords = JSON.parse(storedPasswords);
            } else {
                // Set default passwords if none exist
                const defaultLoginPass = this.hashPassword('admin123');
                const defaultSettingsPass = this.hashPassword('settings123');
                this.passwords = {
                    loginPasswords: [defaultLoginPass],
                    settingsPassword: defaultSettingsPass
                };
                this.savePasswords();
            }
        } catch (error) {
            console.error('Error loading passwords:', error);
        }
    }

    private savePasswords() {
        try {
            localStorage.setItem('secure_passwords', JSON.stringify(this.passwords));
        } catch (error) {
            console.error('Error saving passwords:', error);
        }
    }

    public validateLoginPassword(password: string): boolean {
        const hashedPassword = this.hashPassword(password);
        return this.passwords.loginPasswords.includes(hashedPassword);
    }

    public validateSettingsPassword(password: string): boolean {
        const hashedPassword = this.hashPassword(password);
        return this.passwords.settingsPassword === hashedPassword;
    }

    public addLoginPassword(password: string): void {
        const hashedPassword = this.hashPassword(password);
        if (!this.passwords.loginPasswords.includes(hashedPassword)) {
            this.passwords.loginPasswords.push(hashedPassword);
            this.savePasswords();
        }
    }

    public removeLoginPassword(password: string): boolean {
        const hashedPassword = this.hashPassword(password);
        const index = this.passwords.loginPasswords.indexOf(hashedPassword);
        if (index > -1) {
            this.passwords.loginPasswords.splice(index, 1);
            this.savePasswords();
            return true;
        }
        return false;
    }

    public changeSettingsPassword(oldPassword: string, newPassword: string): boolean {
        if (this.validateSettingsPassword(oldPassword)) {
            this.passwords.settingsPassword = this.hashPassword(newPassword);
            this.savePasswords();
            return true;
        }
        return false;
    }
}
