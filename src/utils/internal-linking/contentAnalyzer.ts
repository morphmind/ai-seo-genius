export class ContentAnalyzer {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async analyzeParagraphs(content: string): Promise<string[]> {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    return Array.from(doc.querySelectorAll('p')).map(p => p.textContent || '');
  }

  async generateLinkText(paragraphText: string, postData: any): Promise<any> {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o",
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
          ]
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

  validateLinkText(linkText: any, postData: any): boolean {
    if (!linkText?.anchor_text) return false;
    
    const anchorLength = linkText.anchor_text.length;
    if (anchorLength < 3 || anchorLength > 60) return false;
    
    return postData.keywords.some((keyword: string) => 
      linkText.anchor_text.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  extractUrlsWithKeywords(posts: any[]): any[] {
    return posts.map(post => ({
      url: post.url,
      similarity: post.similarity || 0,
      keywords: post.analysis.keywords || []
    }));
  }
}