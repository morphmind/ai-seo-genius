import stringSimilarity from 'string-similarity';

export class SimilarityCalculator {
  calculateFuzzySimilarity(text1: string, text2: string): number {
    if (!text1 || !text2) return 0;
    
    const cleanText1 = this.cleanText(text1);
    const cleanText2 = this.cleanText(text2);
    
    console.log("Comparing texts:", {
      original1: text1,
      original2: text2,
      cleaned1: cleanText1,
      cleaned2: cleanText2
    });
    
    const ratio = stringSimilarity.compareTwoStrings(cleanText1, cleanText2);
    console.log("Similarity ratio:", ratio);
    return ratio;
  }

  calculateContentSimilarity(
    concepts1: string[],
    concepts2: string[],
    context1: string = "",
    context2: string = ""
  ): number {
    console.log("Calculating content similarity:", {
      concepts1,
      concepts2,
      context1,
      context2
    });

    if (!concepts1?.length || !concepts2?.length) {
      console.log("Missing concepts, returning 0");
      return 0;
    }

    // Kavramları birleştir
    const concepts1Str = concepts1.join(" ").toLowerCase();
    const concepts2Str = concepts2.join(" ").toLowerCase();

    // Kavram benzerliği hesapla
    const conceptSimilarity = this.calculateFuzzySimilarity(concepts1Str, concepts2Str);
    console.log("Concept similarity:", conceptSimilarity);

    // Bağlam benzerliği hesapla
    let contextSimilarity = 0;
    if (context1 && context2) {
      contextSimilarity = this.calculateFuzzySimilarity(context1, context2);
      console.log("Context similarity:", contextSimilarity);
    }

    // Toplam benzerlik skoru (0.7 kavram, 0.3 bağlam ağırlığı)
    const totalSimilarity = (conceptSimilarity * 0.7) + (contextSimilarity * 0.3);
    console.log("Total similarity score:", totalSimilarity);
    
    return totalSimilarity;
  }

  private cleanText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
}