export interface FormValues {
  preset: string;
  model: string;
  articleType: string;
  targetKeyword: string;
  listNumberingFormat?: string;
  listItemPrompt?: string;
  enableSupplementalInfo?: boolean;
  enableAutoLength?: boolean;
  articleUrl?: string;
  enableRewriting?: boolean;
  seoOptimization: string;
  keywords?: string;
  imageOption: string;
  imageModel?: string;
  imageStyle?: string;
  imageSize?: string;
  maxImages?: number;
  maxVideos?: number;
  toneOfVoice: string;
  language: string;
  country: string;
  pointOfView: string;
  useRealTimeData: boolean;
  realTimeSourceFilter: string;
  customSearchOperators?: string;
  citeSources: boolean;
  useOutlineEditor: boolean;
  includeFaq: boolean;
  includeKeyTakeaways: boolean;
  improveReadability: boolean;
  urlsToLinkTo?: string;
  extraTitlePrompt?: string;
  extraSectionPrompt?: string;
  extraIntroPrompt?: string;
}

export interface ArticleHistory {
  id: string;
  title: string;
  date: string;
  html: string;
  keyword: string;
}
