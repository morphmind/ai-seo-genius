const USER_AGENTS = [
  'PostmanRuntime/7.32.3',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
];

export const analyzeUrl = async (url: string, apiKey: string): Promise<any> => {
  try {
    console.log('Analyzing URL:', url);
    
    // Rotate through user agents
    const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
    
    // Try to fetch through proxy to avoid CORS
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    console.log('Fetching through proxy:', proxyUrl);
    
    const response = await fetch(proxyUrl, {
      headers: {
        'User-Agent': userAgent
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    
    // Parse HTML content using DOMParser
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Extract metadata
    const title = doc.querySelector('title')?.textContent || '';
    const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    const content = doc.body?.textContent?.slice(0, 3000) || ''; // First 3000 chars like Python version
    
    console.log('Extracted metadata:', { title, description });
    
    // Send to OpenAI for analysis with improved prompt
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
            content: "Sen bir SEO ve içerik analiz uzmanısın. İçeriği detaylı analiz et ve belirtilen formatta JSON yanıtı döndür. Yanıtlar sadece Türkçe olmalı."
          },
          {
            role: "user",
            content: `Aşağıdaki içeriği detaylı analiz et.
            
            URL: ${url}
            Başlık: ${title}
            Açıklama: ${description}
            İçerik: ${content}
            
            İçeriği tüm yönleriyle analiz et ve şu formatta yanıt ver:
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
