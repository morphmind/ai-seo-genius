import { secureStorage } from './secureStorage';

const API_STORAGE_KEY = 'api_keys';

interface ApiKeys {
  openaiApiKey: string;
  googleSearchApiKey: string;
  googleSearchEngineId: string;
  googlePlacesApiKey: string;
  semrushApiKey: string;
}

// Load API keys from storage
export const loadApiKeys = async (): Promise<ApiKeys> => {
  return await secureStorage.getItem(API_STORAGE_KEY, {
    openaiApiKey: '',
    googleSearchApiKey: '',
    googleSearchEngineId: '',
    googlePlacesApiKey: '',
    semrushApiKey: ''
  });
};

// Save API keys to storage
export const saveApiKeys = async (keys: ApiKeys): Promise<void> => {
  await secureStorage.setItem(API_STORAGE_KEY, keys);
};

// Get API keys
export const getApiKeys = async (): Promise<ApiKeys> => {
  return await loadApiKeys();
};

// Save individual API key
export const saveApiKey = async (key: keyof ApiKeys, value: string): Promise<void> => {
  const currentKeys = await loadApiKeys();
  currentKeys[key] = value;
  await saveApiKeys(currentKeys);
};
