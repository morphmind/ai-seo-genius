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
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "İçerik analizi yapan bir uzmansın. Verilen metni analiz edip aşağıdaki formatta JSON yanıtı döndür. Başka bir şey ekleme, sadece JSON döndür:\n{\n  \"ana_konular\": [\"konu1\", \"konu2\"],\n  \"anahtar_kelimeler\": [\"kelime1\", \"kelime2\"],\n  \"baglamsal_bilgi\": \"metnin genel bağlamı\"\n}"
            },
            {
              role: "user",
              content: `Bu içeriği analiz et ve belirtilen JSON formatında döndür:\n${content}`
            }
          ],
          temperature: 0.3
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("API Response:", data.choices[0].message.content);
      
      const cleanedContent = data.choices[0].message.content.replace(/```json\n?|\n?```/g, '').trim();
      console.log("Cleaned content:", cleanedContent);
      
      return JSON.parse(cleanedContent);
    } catch (error) {
      console.error("Content analysis error:", error);
      throw error;
    }
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
                content: "SEO ve dil uzmanısın. URL'den çıkarılan anahtar kelimeyi optimize et."
              },
              {
                role: "user",
                content: `Bu URL'den çıkarılan anahtar kelimeyi düzelt ve optimize et: '${keyword}'
                Kurallar:
                1. Dil bilgisi kurallarına uygun olmalı
                2. Doğal ve akıcı olmalı
                3. SEO dostu olmalı
                4. Anlamlı ve konuyla alakalı olmalı
                Sadece optimize edilmiş kelimeyi döndür.`
              }
            ],
            temperature: 0.3
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