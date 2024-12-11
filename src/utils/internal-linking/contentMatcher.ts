import { SimilarityCalculator } from './similarityCalculator';

interface AnalysisResult {
  ana_konular: string[];
  anahtar_kelime: string[];
  bağlam: {
    genel: string;
    hedef_kitle: string;
    amaç: string;
  };
}

interface URLData {
  url: string;
  analysis: AnalysisResult;
}

export class ContentMatcher {
  private similarityCalculator: SimilarityCalculator;

  constructor() {
    this.similarityCalculator = new SimilarityCalculator();
  }

  findRelevantContent(
    articleAnalysis: AnalysisResult,
    availableUrls: URLData[],
    maxLinks: number = 5
  ): Array<URLData & { similarity: number }> {
    // Calculate similarity scores
    const scoredUrls = availableUrls.map(urlData => {
      const similarity = this.similarityCalculator.calculateContentSimilarity(
        articleAnalysis.ana_konular.concat(articleAnalysis.anahtar_kelime),
        urlData.analysis?.ana_konular?.concat(urlData.analysis?.anahtar_kelime) || [],
        articleAnalysis.bağlam.genel,
        urlData.analysis?.bağlam?.genel || ''
      );

      return { ...urlData, similarity };
    });

    // Benzerlik eşiğini 0.15'ten 0.05'e düşürdük
    return scoredUrls
      .filter(url => url.similarity > 0.05)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, maxLinks);
  }
}