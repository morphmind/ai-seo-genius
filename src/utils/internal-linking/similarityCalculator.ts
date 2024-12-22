export class SimilarityCalculator {
    calculateCosineSimilarity(text1: string[], text2: string[]): number {
        const vector1 = this.createVector(text1, this.createVocabulary([...text1, ...text2]));
        const vector2 = this.createVector(text2, this.createVocabulary([...text1, ...text2]));
        
        return this.cosineSimilarity(vector1, vector2);
    }

    private createVocabulary(texts: string[]): Set<string> {
        return new Set(texts.map(text => text.toLowerCase()));
    }

    private createVector(text: string[], vocabulary: Set<string>): number[] {
        const vector = Array(vocabulary.size).fill(0);
        const vocabArray = Array.from(vocabulary);
        
        text.forEach(word => {
            const index = vocabArray.indexOf(word.toLowerCase());
            if (index !== -1) {
                vector[index]++;
            }
        });
        
        return vector;
    }

    private cosineSimilarity(vector1: number[], vector2: number[]): number {
        const dotProduct = vector1.reduce((sum, value, index) => sum + value * vector2[index], 0);
        const magnitude1 = Math.sqrt(vector1.reduce((sum, value) => sum + value * value, 0));
        const magnitude2 = Math.sqrt(vector2.reduce((sum, value) => sum + value * value, 0));
        
        if (magnitude1 === 0 || magnitude2 === 0) return 0;
        return dotProduct / (magnitude1 * magnitude2);
    }

    calculateFuzzySimilarity(text1: string, text2: string): number {
        const set1 = new Set(text1.toLowerCase().split(/\s+/));
        const set2 = new Set(text2.toLowerCase().split(/\s+/));
        
        const intersection = new Set([...set1].filter(x => set2.has(x)));
        const union = new Set([...set1, ...set2]);
        
        return intersection.size / union.size;
    }

    calculateContentSimilarity(concepts1: string[], concepts2: string[], context1: string = "", context2: string = ""): number {
        // Kavram benzerliği (0.7 ağırlık)
        const conceptSimilarity = this.calculateCosineSimilarity(concepts1, concepts2);
        
        // Bağlam benzerliği (0.3 ağırlık)
        const contextSimilarity = context1 && context2 
            ? this.calculateFuzzySimilarity(context1, context2)
            : 0;
        
        return (conceptSimilarity * 0.7) + (contextSimilarity * 0.3);
    }
}
