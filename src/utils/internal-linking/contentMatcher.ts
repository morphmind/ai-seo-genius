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
    console.log("Article Analysis:", JSON.stringify(articleAnalysis, null, 2));
    console.log("Available URLs sample:", availableUrls.slice(0, 2));

    if (!articleAnalysis || !availableUrls?.length) {
      console.log("No article analysis or URLs available");
      return [];
    }

    const articleKeywords = [
      ...(articleAnalysis.ana_konular || []),
      ...(articleAnalysis.anahtar_kelimeler || [])
    ];

    console.log("Article Keywords:", articleKeywords);

    const scoredUrls = availableUrls
      .filter(urlData => {
        const isValid = urlData && urlData.analysis && urlData.url;
        if (!isValid) {
          console.log("Invalid URL data entry:", urlData);
        }
        return isValid;
      })
      .map(urlData => {
        const urlKeywords = [
          ...(urlData.analysis?.ana_konular || []),
          ...(urlData.analysis?.anahtar_kelimeler || [])
        ];

        console.log(`Processing URL ${urlData.url}:`, {
          urlKeywords,
          articleKeywords
        });

        const similarity = this.similarityCalculator.calculateContentSimilarity(
          articleKeywords,
          urlKeywords,
          articleAnalysis.baglamsal_bilgi || '',
          urlData.analysis?.baglamsal_bilgi || ''
        );

        console.log(`Similarity score for ${urlData.url}:`, similarity);

        return { ...urlData, similarity };
      });

    // Benzerlik eşiği 0.001'e düşürüldü
    const filteredUrls = scoredUrls
      .filter(url => {
        const passes = url.similarity > 0.001;
        console.log(`URL ${url.url} ${passes ? 'passed' : 'failed'} similarity threshold:`, url.similarity);
        return passes;
      })
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, maxLinks);

    console.log("Final filtered URLs:", filteredUrls);
    return filteredUrls;
  }
}