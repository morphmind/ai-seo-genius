import { SimilarityCalculator } from './similarityCalculator';

interface AnalysisResult {
  main_topics: string[];
  keywords: string[];
  context: string;
  content_type: string;
  key_concepts: string[];
  secondary_topics: string[];
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
        articleAnalysis.main_topics.concat(articleAnalysis.keywords),
        urlData.analysis.main_topics.concat(urlData.analysis.keywords),
        articleAnalysis.context,
        urlData.analysis.context
      );

      return { ...urlData, similarity };
    });

    // Sort by similarity and return top matches
    return scoredUrls
      .filter(url => url.similarity > 0.15)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, maxLinks);
  }
}