const USER_AGENTS = [
  'PostmanRuntime/7.32.3',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
];

export const analyzeUrl = async (url: string, apiKey: string): Promise<any> => {
  try {
    // Rotate through user agents
    const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': userAgent
      },
      mode: 'no-cors', // Add no-cors mode
      // @ts-ignore
      rejectUnauthorized: false
    });

    if (!response.ok && response.type !== 'opaque') {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    
    // Extract basic metadata
    const title = html.match(/<title>(.*?)<\/title>/i)?.[1] || '';
    const description = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i)?.[1] || '';
    
    // Send to OpenAI for analysis
    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Sen bir SEO uzmanısın. Yanıtları sadece Türkçe olarak ver ve SADECE geçerli JSON formatında, markdown veya backtick kullanmadan döndür."
          },
          {
            role: "user",
            content: `Aşağıdaki URL ve içeriği analiz et:
            
            URL: ${url}
            Başlık: ${title}
            Açıklama: ${description}
            
            Şu formatta yanıt ver:
            {
              "main_topics": ["ana_konu_1", "ana_konu_2"],
              "keywords": ["anahtar1", "anahtar2", "anahtar3"],
              "context": "içeriğin genel bağlamı",
              "content_type": "article|tutorial|info|review",
              "key_concepts": ["kavram1", "kavram2"],
              "secondary_topics": ["yan_konu_1", "yan_konu_2"]
            }`
          }
        ],
        temperature: 0.7
      })
    });

    if (!aiResponse.ok) {
      throw new Error('AI analiz hatası');
    }

    const data = await aiResponse.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error('URL analysis error:', error);
    throw error;
  }
};