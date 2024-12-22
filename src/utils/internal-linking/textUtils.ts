// Kelime sayısını hesapla
export function calculateWordCount(text: string): number {
    return text.trim().split(/\s+/).length;
}

// Paragrafları çıkar
export function extractParagraphs(htmlContent: string): string[] {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    return Array.from(tempDiv.querySelectorAll('p'))
        .map(p => p.textContent?.trim() || '')
        .filter(text => text.length > 0);
}

// Doğal link metni oluştur
export function generateLinkText(paragraph: string, keyword: string): string {
    // Kelimenin paragraftaki pozisyonunu bul
    const position = paragraph.toLowerCase().indexOf(keyword.toLowerCase());
    if (position === -1) return '';

    // Cümleyi bul
    let sentenceStart = paragraph.lastIndexOf('.', position) + 1;
    let sentenceEnd = paragraph.indexOf('.', position);
    
    if (sentenceStart === -1) sentenceStart = 0;
    if (sentenceEnd === -1) sentenceEnd = paragraph.length;

    // Cümleyi al
    const sentence = paragraph.substring(sentenceStart, sentenceEnd).trim();

    // Link metnini cümlenin içine yerleştir
    const linkText = sentence.replace(
        new RegExp(keyword, 'i'),
        match => `<a href="URL_PLACEHOLDER">${match}</a>`
    );

    return linkText;
}

// HTML'den metin çıkar
export function stripHtml(html: string): string {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
}

// HTML'e link ekle
export function insertLink(html: string, position: number, linkHtml: string): string {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    const paragraphs = tempDiv.querySelectorAll('p');
    if (position < paragraphs.length) {
        const targetParagraph = paragraphs[position];
        const container = document.createElement('div');
        container.innerHTML = linkHtml;
        targetParagraph.insertAdjacentElement('afterend', container);
    }

    return tempDiv.innerHTML;
}
