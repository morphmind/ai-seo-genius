export interface LinkText {
  pre_text?: string;
  anchor_text: string;
  post_text?: string;
}

export interface PostData {
  url: string;
  similarity: number;
  keywords: string[];
}

export interface AddedLink {
  url: string;
  anchor_text: string;
  position: string;
  similarity_score: number;
}

export interface ArticleResult {
  name: string;
  links_added: number;
  success: boolean;
  error?: string;
}

export interface LinkingReport {
  stats: {
    total_articles: number;
    successful_articles: number;
    failed_articles: number;
    total_links_added: number;
    added_links: AddedLink[];
  };
  article_results: ArticleResult[];
}
