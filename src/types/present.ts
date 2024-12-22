import { Provider, Model } from './content';

export interface Present {
  id: string;
  name: string;
  settings: {
    provider: Provider;
    model: Model;
    inputLanguage: "tr" | "en";
    outputLanguage: "tr" | "en";
    includeFAQ: boolean;
  };
}
