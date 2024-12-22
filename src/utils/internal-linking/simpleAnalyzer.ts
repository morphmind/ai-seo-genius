export function simpleAnalyzeContent(content: string) {
    // Metni temizle ve kelimelere ayır
    const words = content.toLowerCase()
        .replace(/[^a-zçğıöşü\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 2);

    // Kelime frekansı
    const wordFreq: { [key: string]: number } = {};
    words.forEach(word => {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
    });

    // En sık geçen kelimeler
    const sortedWords = Object.entries(wordFreq)
        .sort(([,a], [,b]) => b - a)
        .map(([word]) => word);

    return {
        ana_konular: sortedWords.slice(0, 3),
        keywords: sortedWords.slice(3, 8),
        context: content.slice(0, 200),
        content_type: "article",
        key_concepts: sortedWords.slice(0, 5),
        secondary_topics: sortedWords.slice(5, 10),
    };
}
