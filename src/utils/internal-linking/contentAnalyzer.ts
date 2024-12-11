import { LinkText, PostData } from './types';

export class ContentAnalyzer {
  constructor(private apiKey: string) {}

  async analyzeParagraphs(content: string): Promise<string[]> {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'html');
    return Array.from(doc.querySelectorAll('p')).map(p => p.textContent || '');
  }

  async generateLinkText(paragraphText: string, postData: PostData): Promise<LinkText | null> {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: "Sen bir içerik editörüsün. Verilen paragraf ve anahtar kelimeler için doğal bir bağlantı metni oluştur."
            },
            {
              role: "user",
              content: `
                Paragraf: ${paragraphText}
                Anahtar Kelimeler: ${postData.keywords.join(', ')}
                URL: ${postData.url}
                
                Şu formatta yanıt ver:
                {
                  "pre_text": "Bağlantı öncesi metin",
                  "anchor_text": "Bağlantı metni",
                  "post_text": "Bağlantı sonrası metin"
                }
              `
            }
          ],
          temperature: 0.3
        })
      });

      if (!response.ok) {
        throw new Error('Link metni oluşturma hatası');
      }

      const data = await response.json();
      return JSON.parse(data.choices[0].message.content);
    } catch (error) {
      console.error('Link metni oluşturma hatası:', error);
      return null;
    }
  }

  validateLinkText(linkText: LinkText, postData: PostData): boolean {
    if (!linkText.anchor_text) return false;
    
    const anchorLength = linkText.anchor_text.length;
    if (anchorLength < 3 || anchorLength > 60) return false;
    
    // Anahtar kelimelerden en az birini içermeli
    return postData.keywords.some(keyword => 
      linkText.anchor_text.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  extractUrlsWithKeywords(posts: any[]): PostData[] {
    return posts.map(post => ({
      url: post.url,
      similarity: post.similarity || 0,
      keywords: post.analysis.keywords || []
    }));
  }
}