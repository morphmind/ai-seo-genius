import { Present } from '@/types/present';
import { Provider, Model } from '@/types/content';

const STORAGE_KEY = 'ai_seo_presets';

export const getPresents = (): Present[] => {
  const presetsStr = localStorage.getItem(STORAGE_KEY);
  return presetsStr ? JSON.parse(presetsStr) : [];
};

export const savePresent = (present: Present): void => {
  const presents = getPresents();
  const existingIndex = presents.findIndex(p => p.id === present.id);
  
  if (existingIndex >= 0) {
    // Update existing present
    presents[existingIndex] = present;
  } else {
    // Add new present
    presents.push(present);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presents));
};

export const deletePresent = (id: string): void => {
  const presents = getPresents();
  const filteredPresents = presents.filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredPresents));
};

export const createNewPresent = (
  name: string,
  provider: Provider,
  model: Model,
  inputLanguage: "tr" | "en",
  outputLanguage: "tr" | "en",
  includeFAQ: boolean
): Present => {
  return {
    id: crypto.randomUUID(),
    name,
    settings: {
      provider,
      model,
      inputLanguage,
      outputLanguage,
      includeFAQ
    }
  };
};
