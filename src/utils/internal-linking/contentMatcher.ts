import { SimilarityCalculator } from './similarityCalculator';

interface AnalysisResult {
  ana_konular: string[];
  anahtar_kelimeler: string[];
  baglamsal_bilgi: string;
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
    console.log("Article Analysis:", articleAnalysis);
    console.log("Available URLs:", availableUrls);

    const scoredUrls = availableUrls.map(urlData => {
      const similarity = this.similarityCalculator.calculateContentSimilarity(
        (articleAnalysis.ana_konular || []).concat(articleAnalysis.anahtar_kelimeler || []),
        (urlData.analysis?.ana_konular || []).concat(urlData.analysis?.anahtar_kelimeler || []),
        articleAnalysis.baglamsal_bilgi || '',
        urlData.analysis?.baglamsal_bilgi || ''
      );

      return { ...urlData, similarity };
    });

    // Benzerlik eşiği 0.05 olarak ayarlandı
    const filteredUrls = scoredUrls
      .filter(url => url.similarity > 0.05)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, maxLinks);

    console.log("Filtered URLs:", filteredUrls);
    return filteredUrls;
  }
}