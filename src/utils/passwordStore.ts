import { secureStorage } from './secureStorage';

const STORAGE_KEY = 'auth_credentials';

interface StoredPassword {
  hash: string;
  salt: string;
}

interface PasswordStore {
  loginPasswords: StoredPassword[];
  settingsPassword: StoredPassword | null;
}

let passwordStore: PasswordStore = {
  loginPasswords: [],
  settingsPassword: null
};

// Hash password using Web Crypto API
const hashPassword = async (password: string, salt: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-512', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Generate random salt
const generateSalt = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
};

// Load passwords from storage
export const loadPasswords = async () => {
  passwordStore = await secureStorage.getItem(STORAGE_KEY, {
    loginPasswords: [],
    settingsPassword: null
  });
};

// Save current state to storage
const saveStore = async () => {
  await secureStorage.setItem(STORAGE_KEY, passwordStore);
};

// Add a new login password
export const addLoginPassword = async (password: string): Promise<void> => {
  const salt = generateSalt();
  const hash = await hashPassword(password, salt);
  passwordStore.loginPasswords.push({ hash, salt });
  await saveStore();
};

// Set settings password
export const setSettingsPassword = async (password: string): Promise<void> => {
  const salt = generateSalt();
  const hash = await hashPassword(password, salt);
  passwordStore.settingsPassword = { hash, salt };
  await saveStore();
};

// Remove a login password
export const removeLoginPassword = async (index: number): Promise<void> => {
  passwordStore.loginPasswords.splice(index, 1);
  await saveStore();
};

// Validate login password
export const validateLoginPassword = async (password: string): Promise<boolean> => {
  for (const { hash, salt } of passwordStore.loginPasswords) {
    const testHash = await hashPassword(password, salt);
    if (testHash === hash) return true;
  }
  return false;
};

// Validate settings password
export const validateSettingsPassword = async (password: string): Promise<boolean> => {
  if (!passwordStore.settingsPassword) return false;
  
  const { hash, salt } = passwordStore.settingsPassword;
  const testHash = await hashPassword(password, salt);
  return testHash === hash;
};

// Get all login passwords (hashed)
export const getLoginPasswords = (): StoredPassword[] => {
  return [...passwordStore.loginPasswords];
};

// Get total number of login passwords
export const getLoginPasswordCount = (): number => {
  return passwordStore.loginPasswords.length;
};

// Check if settings password exists
export const hasSettingsPassword = (): boolean => {
  return passwordStore.settingsPassword !== null;
};

// Initialize default passwords
export const initializePasswords = async () => {
  // Önce mevcut şifreleri yükle
  await loadPasswords();
  
  // Eğer hiç şifre yoksa, varsayılan şifreleri ekle
  if (passwordStore.loginPasswords.length === 0) {
    // Varsayılan şifreleri ekle
    await addLoginPassword('yeni_sifre1');
    await addLoginPassword('yeni_sifre2');
    await setSettingsPassword('yeni_settings');
  }
};

// Clear all stored passwords
export const clearPasswords = async () => {
  passwordStore = {
    loginPasswords: [],
    settingsPassword: null
  };
  await saveStore();
};
