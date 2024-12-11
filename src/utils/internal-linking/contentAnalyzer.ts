export class ContentAnalyzer {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async analyzeContent(content: string): Promise<any> {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "Sen bir içerik analiz uzmanısın. Verilen metni analiz edip ana konuları, anahtar kelimeleri ve bağlamı çıkaracaksın."
            },
            {
              role: "user",
              content: `Bu içeriği analiz et ve şu formatta döndür:
                {
                  "main_topics": ["konu1", "konu2"],
                  "keywords": ["kelime1", "kelime2"],
                  "context": "içeriğin genel bağlamı",
                  "content_type": "içerik tipi",
                  "key_concepts": ["kavram1", "kavram2"],
                  "secondary_topics": ["ikincil_konu1", "ikincil_konu2"]
                }

                İçerik: ${content}`
            }
          ],
          temperature: 0.3,
          max_tokens: 1000
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`API Error: ${data.error?.message || 'Unknown error'}`);
      }

      try {
        return JSON.parse(data.choices[0].message.content);
      } catch (e) {
        console.error("JSON parse error:", e);
        console.log("Raw content:", data.choices[0].message.content);
        throw new Error("Content analysis result parsing failed");
      }
    } catch (error) {
      console.error("Content analysis error:", error);
      throw error;
    }
  }

  async analyzeParagraphs(content: string): Promise<string[]> {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const paragraphs = Array.from(doc.querySelectorAll('p'));
    
    return paragraphs
      .filter(p => {
        const text = p.textContent?.trim() || '';
        return text && !this.isNavigationOrFooter(p);
      })
      .map(p => p.textContent || '');
  }

  private isNavigationOrFooter(element: Element): boolean {
    if (element.className) {
      const classes = element.className.toLowerCase();
      return ['nav', 'menu', 'footer', 'header'].some(term => classes.includes(term));
    }
    return false;
  }

  async extractUrlsWithKeywords(relevantPosts: any[]): Promise<any[]> {
    const processedUrls = [];

    for (const post of relevantPosts) {
      try {
        const url = post.url;
        const path = url.split('/').pop()?.split('?')[0] || '';
        const keyword = path.replace(/-/g, ' ');

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
                content: "Sen bir SEO ve dil uzmanısın."
              },
              {
                role: "user",
                content: `Bu URL'den çıkarılan anahtar kelimeyi düzelt ve optimize et: '${keyword}'

                Kurallar:
                1. Dil bilgisi kurallarına uygun olmalı
                2. Doğal ve akıcı olmalı
                3. SEO dostu olmalı
                4. Anlamlı ve konuyla alakalı olmalı

                Sadece düzeltilmiş kelimeyi döndür, başka bir şey ekleme.`
              }
            ],
            temperature: 0.3,
            max_tokens: 50
          })
        });

        const data = await response.json();
        const optimizedKeyword = data.choices[0].message.content.trim();

        processedUrls.push({
          url,
          keyword: optimizedKeyword,
          analysis: post.analysis || {},
          similarity: post.similarity || 0
        });

      } catch (error) {
        console.error(`URL işleme hatası (${post.url}):`, error);
        continue;
      }
    }

    return processedUrls;
  }
}