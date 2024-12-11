import stringSimilarity from 'string-similarity';

export class SimilarityCalculator {
  calculateFuzzySimilarity(text1: string, text2: string): number {
    const ratio = stringSimilarity.compareTwoStrings(text1.toLowerCase(), text2.toLowerCase());
    return ratio;
  }

  calculateContentSimilarity(
    concepts1: string[],
    concepts2: string[],
    context1: string = "",
    context2: string = ""
  ): number {
    // Convert concepts to strings
    const concepts1Str = concepts1.join(" ");
    const concepts2Str = concepts2.join(" ");

    // Calculate concept similarity
    const conceptSimilarity = this.calculateFuzzySimilarity(concepts1Str, concepts2Str);

    // Calculate context similarity if available
    let contextSimilarity = 0;
    if (context1 && context2) {
      contextSimilarity = this.calculateFuzzySimilarity(context1, context2);
    }

    // Total similarity score (0.7 concept, 0.3 context weight)
    return (conceptSimilarity * 0.7) + (contextSimilarity * 0.3);
  }
}