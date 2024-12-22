import { calculateWordCount, extractParagraphs, generateLinkText } from './textUtils';

interface ProcessedParagraph {
    text: string;
    wordCount: number;
    hasLinks: boolean;
    isEndOfSection: boolean;
    position: number;
}

export class ContentProcessor {
    // Link pozisyonlarını hesapla
    calculateLinkPositions(totalParagraphs: number, maxLinks: number): number[] {
        if (totalParagraphs < 3) return [];

        // Son %15'i kullanma
        const effectiveParagraphs = Math.floor(totalParagraphs * 0.85);
        if (effectiveParagraphs < maxLinks) return [];

        // İdeal aralığı hesapla
        const spacing = Math.floor(effectiveParagraphs / maxLinks);

        // İlk linki 3. paragraftan önce ekleme
        const positions = [Math.max(3, Math.floor(spacing / 2))];

        // Diğer linklerin pozisyonlarını hesapla
        for (let i = 1; i < maxLinks; i++) {
            let nextPos = positions[positions.length - 1] + spacing;
            if (i === maxLinks - 1) {
                nextPos = Math.min(nextPos, effectiveParagraphs - 2);
            }
            positions.push(nextPos);
        }

        return positions;
    }

    // İçeriği analiz et
    analyzeParagraphs(htmlContent: string): ProcessedParagraph[] {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        const paragraphs: ProcessedParagraph[] = [];
        let position = 0;

        tempDiv.querySelectorAll('p').forEach(p => {
            const text = p.textContent?.trim() || '';
            if (text && !this.isNavigationOrFooter(p)) {
                paragraphs.push({
                    text,
                    wordCount: this.calculateWordCount(text),
                    hasLinks: p.querySelectorAll('a').length > 0,
                    isEndOfSection: this.isEndOfSection(p),
                    position: position++
                });
            }
        });

        return paragraphs;
    }

    private calculateWordCount(text: string): number {
        return text.trim().split(/\s+/).length;
    }

    private isNavigationOrFooter(element: Element): boolean {
        const classes = element.className.toLowerCase();
        return /nav|menu|footer|header/i.test(classes);
    }

    private isEndOfSection(element: Element): boolean {
        const nextElem = element.nextElementSibling;
        if (nextElem && ['H1', 'H2', 'H3', 'H4', 'HR'].includes(nextElem.tagName)) {
            return true;
        }
        return false;
    }

    // Link yerleştirme kontrolü
    validateLinkPlacement(paragraph: ProcessedParagraph, link: any): boolean {
        // Çok kısa paragrafları atla
        if (paragraph.wordCount < 20) return false;

        // Zaten link içeren paragrafları atla
        if (paragraph.hasLinks) return false;

        // Bölüm sonu paragraflarını atla
        if (paragraph.isEndOfSection) return false;

        return true;
    }

    // Bir paragraf için en iyi anchor text'i seç
    selectBestAnchorText(text: string, keywords: string[]): string | null {
        // Her anahtar kelime için uygunluk kontrolü yap
        const scores = keywords.map(keyword => {
            // Kelime paragrafta geçiyor mu?
            if (!text.toLowerCase().includes(keyword.toLowerCase())) {
                return { keyword, score: 0 };
            }

            // Kelimenin pozisyonu
            const position = text.toLowerCase().indexOf(keyword.toLowerCase());
            const relativePosition = position / text.length;

            // İdeal pozisyon ortada olmalı (0.3-0.7 arası)
            const positionScore = relativePosition > 0.3 && relativePosition < 0.7 ? 1 : 0.5;

            // Kelime uzunluğu değerlendirmesi
            const lengthScore = keyword.split(' ').length >= 2 ? 1 : 0.7;

            return {
                keyword,
                score: positionScore * lengthScore
            };
        });

        // En yüksek skora sahip kelimeyi seç
        const bestMatch = scores.reduce((best, current) => 
            current.score > best.score ? current : best
        , { keyword: '', score: 0 });

        return bestMatch.score > 0.7 ? bestMatch.keyword : null;
    }

    // Link HTML'i oluştur
    createLinkHtml(url: string, anchorText: string, similarityScore: number): string {
        return `<div class="related-content" style="margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-left: 3px solid #7952b3; border-radius: 3px;">
            <i class="fa-solid fa-arrow-right" style="margin-right: 8px; color: #7952b3;"></i>
            <a href="${url}" 
               class="internal-link"
               title="${anchorText}"
               data-similarity="${similarityScore}"
               style="color: #7952b3; text-decoration: none; font-weight: 500; transition: color 0.2s;">
                ${anchorText}
            </a>
        </div>`;
    }

    // Link eklemeden önce son kontrol
    validateLinkText(text: string, anchorText: string): boolean {
        // Kelime sayısı kontrolü
        const words = text.split(/\s+/).length;
        if (words < 5 || words > 150) return false;

        // Yasaklı kalıplar kontrolü
        const bannedPatterns = [
            'tıklayın', 'buradan', 'detaylı bilgi',
            'daha fazla', 'yazımız', 'makalemiz'
        ];
        
        if (bannedPatterns.some(pattern => text.toLowerCase().includes(pattern))) {
            return false;
        }

        // Anchor text pozisyon kontrolü
        const position = text.toLowerCase().indexOf(anchorText.toLowerCase());
        if (position === -1) return false;

        const relativePosition = position / text.length;
        if (relativePosition < 0.2 || relativePosition > 0.8) return false;

        return true;
    }
}
