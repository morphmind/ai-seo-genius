import stringSimilarity from 'string-similarity';

export class ContentMatcher {
    findRelevantContent(
        sourceAnalysis: any,
        urlDatabase: any[],
        maxLinks: number
    ): any[] {
        try {
            console.log("Source Analysis:", sourceAnalysis);
            
            // Ana konuları ve anahtar kelimeleri birleştir
            const sourceKeywords = [
                ...(sourceAnalysis.main_topics || []),
                ...(sourceAnalysis.keywords || []),
                ...(sourceAnalysis.key_concepts || [])
            ].map(k => k.toLowerCase());

            const matches = urlDatabase.map(urlData => {
                // URL içeriğinin anahtar kelimelerini birleştir
                const targetKeywords = [
                    ...(urlData.analysis?.main_topics || []),
                    ...(urlData.analysis?.keywords || []),
                    ...(urlData.analysis?.key_concepts || [])
                ].map(k => k.toLowerCase());

                // Ana benzerlik skorunu hesapla
                const keywordSimilarity = this.calculateKeywordSimilarity(sourceKeywords, targetKeywords);
                const contextSimilarity = this.calculateContextSimilarity(
                    sourceAnalysis.context || '',
                    urlData.analysis?.context || ''
                );

                // Skorları birleştir (keyword 0.7, context 0.3 ağırlıklı)
                const similarity = (keywordSimilarity * 0.7) + (contextSimilarity * 0.3);

                // İçerik tipi eşleşirse bonus ver
                const contentTypeBonus = (sourceAnalysis.content_type === urlData.analysis?.content_type) ? 0.1 : 0;
                
                return {
                    ...urlData,
                    similarity: Math.min((similarity + contentTypeBonus) * 100, 100)
                };
            });

            // Debug
            console.log("Initial matches:", matches.length);
            
            // Minimum benzerlik skoru: 30%
            const filteredMatches = matches.filter(m => m.similarity > 30);
            console.log("Matches with similarity > 30:", filteredMatches.length);

            // En iyi eşleşmeleri seç ve URL'den başlıkları çıkar
            const relevantMatches = filteredMatches
                .sort((a, b) => b.similarity - a.similarity)
                .slice(0, maxLinks)
                .map(match => ({
                    ...match,
                    title: this.extractTitleFromUrl(match.url),
                    anchor_text: this.extractTitleFromUrl(match.url) // Doğrudan URL'den çıkarılan başlığı anchor_text olarak kullan
                }));

            console.log("Final relevant matches:", relevantMatches);

            return relevantMatches;

        } catch (error) {
            console.error("İçerik eşleştirme hatası:", error);
            return [];
        }
    }

    private calculateKeywordSimilarity(sourceKeywords: string[], targetKeywords: string[]): number {
        if (!sourceKeywords.length || !targetKeywords.length) return 0;

        // Her bir kaynak kelime için en iyi eşleşmeyi bul
        const similarities = sourceKeywords.map(sourceWord => {
            const scores = targetKeywords.map(targetWord => 
                stringSimilarity.compareTwoStrings(sourceWord, targetWord)
            );
            return Math.max(...scores);
        });

        // Ortalama benzerlik skorunu hesapla
        return similarities.reduce((a, b) => a + b, 0) / similarities.length;
    }

    private calculateContextSimilarity(sourceContext: string, targetContext: string): number {
        return stringSimilarity.compareTwoStrings(
            sourceContext.toLowerCase(),
            targetContext.toLowerCase()
        );
    }

    private extractTitleFromUrl(url: string): string {
        try {
            const lastSegment = url.split('/').pop() || '';
            return lastSegment
                .split('-')
                .map(word => this.turkishToLower(word))
                .join(' ')
                .replace(/\.(html|php|aspx?)$/i, '');
        } catch (error) {
            return '';
        }
    }

    private turkishToLower(text: string): string {
        const turkishChars: { [key: string]: string } = {
            'İ': 'i',
            'I': 'ı',
            'Ğ': 'ğ',
            'Ü': 'ü',
            'Ş': 'ş',
            'Ö': 'ö',
            'Ç': 'ç'
        };
        
        return text.replace(/[İIĞÜŞÖÇ]/g, letter => turkishChars[letter] || letter).toLowerCase();
    }
}
