export class ContentMatcher {
  findRelevantContent(articleAnalysis: any, urlDatabase: any[], maxLinks: number) {
    try {
      // Benzerlik skorlarını hesapla
      const scoredUrls = urlDatabase.map(urlData => {
        const similarity = this.calculateSimilarity(articleAnalysis, urlData.analysis);
        return { ...urlData, similarity };
      });

      // Skorlara göre sırala ve en iyi eşleşmeleri döndür
      return scoredUrls
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, maxLinks);
    } catch (error) {
      console.error('İçerik eşleştirme hatası:', error);
      return [];
    }
  }

  private calculateSimilarity(analysis1: any, analysis2: any): number {
    try {
      let score = 0;

      // Ana konular karşılaştırması
      const mainTopicsMatch = this.calculateArraySimilarity(
        analysis1.main_topics || [],
        analysis2.main_topics || []
      );
      score += mainTopicsMatch * 0.4;

      // Anahtar kelimeler karşılaştırması
      const keywordsMatch = this.calculateArraySimilarity(
        analysis1.keywords || [],
        analysis2.keywords || []
      );
      score += keywordsMatch * 0.3;

      // İkincil konular karşılaştırması
      const secondaryTopicsMatch = this.calculateArraySimilarity(
        analysis1.secondary_topics || [],
        analysis2.secondary_topics || []
      );
      score += secondaryTopicsMatch * 0.2;

      // İçerik tipi karşılaştırması
      if (analysis1.content_type === analysis2.content_type) {
        score += 0.1;
      }

      return score;
    } catch (error) {
      console.error('Benzerlik hesaplama hatası:', error);
      return 0;
    }
  }

  private calculateArraySimilarity(arr1: string[], arr2: string[]): number {
    if (!arr1.length || !arr2.length) return 0;

    const set1 = new Set(arr1.map(s => s.toLowerCase()));
    const set2 = new Set(arr2.map(s => s.toLowerCase()));

    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    return intersection.size / union.size;
  }
}