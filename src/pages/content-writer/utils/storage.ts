import { ArticleHistory } from "../types";

const MAX_HISTORY_ITEMS = 50; // Maksimum saklanacak makale sayısı
const STORAGE_KEY = "article_history";

export const saveArticleHistory = (articles: ArticleHistory[]) => {
  try {
    // Makale sayısını sınırla
    const limitedArticles = articles.slice(0, MAX_HISTORY_ITEMS);
    
    // Veriyi optimize et - uzun HTML içeriğini kısalt
    const optimizedArticles = limitedArticles.map(article => ({
      ...article,
      html: article.html.slice(0, 100000) // HTML içeriğini maksimum 100KB ile sınırla
    }));
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(optimizedArticles));
    return true;
  } catch (error) {
    console.error("Failed to save article history:", error);
    return false;
  }
};

export const getArticleHistory = (): ArticleHistory[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Failed to get article history:", error);
    return [];
  }
};

export const deleteArticle = (id: string): boolean => {
  try {
    const articles = getArticleHistory();
    const updatedArticles = articles.filter(article => article.id !== id);
    return saveArticleHistory(updatedArticles);
  } catch (error) {
    console.error("Failed to delete article:", error);
    return false;
  }
};
