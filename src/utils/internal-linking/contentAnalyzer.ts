import OpenAI from 'openai';

export class ContentAnalyzer {
    private openai: OpenAI;

    constructor(apiKey: string) {
        this.openai = new OpenAI({ 
            apiKey: apiKey,
            dangerouslyAllowBrowser: true
        });
    }

    async analyzeContent(content: string): Promise<any> {
        try {
            const systemPrompt = `You are a content analyzer that specializes in understanding article context and topic relationships. Always respond with a valid JSON object.`;
            
            const userPrompt = `Analyze this content in detail and extract key information:

Content: ${content.substring(0, 3000)}

Respond with a JSON object with this structure:
{
    "main_topics": ["primary topic 1", "primary topic 2"],
    "keywords": ["key term 1", "key term 2", "key term 3"],
    "context": "brief description of content context",
    "content_type": "article|tutorial|info|review",
    "key_concepts": ["important concept 1", "important concept 2"],
    "secondary_topics": ["related topic 1", "related topic 2"],
    "is_detailed": true|false
}`;

            const completion = await this.openai.chat.completions.create({
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                model: "gpt-4-0125-preview",
                temperature: 0.3,
                response_format: { type: "json_object" }
            });

            const response = completion.choices[0].message.content;
            if (!response) throw new Error("API yanıt vermedi");

            return JSON.parse(response);

        } catch (error) {
            console.error("Content analysis error:", error);
            return {
                main_topics: [],
                keywords: [],
                context: "",
                content_type: "article",
                key_concepts: [],
                secondary_topics: [],
                is_detailed: false
            };
        }
    }

    analyzeParagraphs(content: string): any[] {
        const div = document.createElement('div');
        div.innerHTML = content;
        const paragraphs = [];
        let index = 0;

        div.querySelectorAll('p').forEach(p => {
            const text = p.textContent?.trim() || '';
            if (text && !this.isNavigationOrFooter(p)) {
                paragraphs.push({
                    text,
                    wordCount: this.calculateWordCount(text),
                    hasLinks: p.querySelectorAll('a').length > 0,
                    isEndOfSection: this.isEndOfSection(p),
                    index: index++
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
        return nextElem && ['H1', 'H2', 'H3', 'H4', 'HR'].includes(nextElem.tagName);
    }

    async optimizeTitle(title: string): Promise<string> {
        try {
            const prompt = `Bu URL başlığını Türkçe karakter ve gramer kurallarına uygun hale getir: "${title}"

Kurallar:
1. Sadece gerekli olan yerlerde Türkçe karakter kullan
2. Her kelimeyi değil, sadece Türkçe'de karşılığı olan kelimeleri düzelt
3. URL'den gelen "-" işaretlerini boşluğa çevir
4. Gramer kurallarına uygun hale getir

Örnekler:
✓ "ingilizce-ogrenme" -> "ingilizce öğrenme"
✓ "web-programlama" -> "web programlama" (web kelimesi değişmez)
✓ "online-egitim" -> "online eğitim" (online kelimesi değişmez)
✓ "python-dersleri" -> "python dersleri" (python kelimesi değişmez)

Sadece düzeltilmiş metni döndür, başka bir şey ekleme.`;

            const completion = await this.openai.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: "Sen bir dil uzmanısın. URL metinlerini doğru Türkçe formata çevirirsin."
                    },
                    { role: "user", content: prompt }
                ],
                model: "gpt-4-0125-preview",
                temperature: 0.3
            });

            const optimizedTitle = completion.choices[0].message.content?.trim();
            return optimizedTitle || title;

        } catch (error) {
            console.error("Title optimization error:", error);
            return title;
        }
    }

    async generateLinkText(paragraphText: string, urlData: any): Promise<any> {
        try {
            // URL'den başlığı al ve optimize et
            const rawTitle = urlData.title || urlData.url.split('/').pop()?.replace(/-/g, ' ');
            const optimizedTitle = await this.optimizeTitle(rawTitle);

            // Cümle içeriği oluştur
            const systemPrompt = `Sen bir içerik editörüsün. Verilen başlık ve paragrafı kullanarak doğal bir cümle oluşturman gerekiyor.`;
            
            const userPrompt = `GÖREV: Bu başlığı ve konuyu kullanarak doğal ve akıcı bir cümle oluş.

BAŞLIK: "${optimizedTitle}"

PARAGRAF İÇERİĞİ:
${paragraphText.substring(0, 300)}

KURALLAR:
1. Cümle doğal ve akıcı olmalı
2. Başlık tırnak işareti olmadan cümle içine yerleştirilmeli
3. "detaylı bilgi için", "tıklayın", "göz atın", "inceleyin" gibi ifadeler KULLANMA
4. Cümle başlangıcında veya sonunda değil, ortada kullan
5. Cümle anlamlı ve Türkçe dil bilgisi kurallarına uygun olmalı

ÖRNEK İYİ CÜMLELER:
- "Araştırmalar, etkili zaman yönetimi tekniklerinin öğrenci başarısını artırdığını gösteriyor"
- "Özellikle ana dili öğreniminde uygulanan modern yöntemler, öğrencilerin gelişimini hızlandırıyor"
- "Uzmanların önerdiği yeni öğrenme stratejileri, öğrencilerin motivasyonunu yükseltiyor"

Yanıt olarak sadece aşağıdaki JSON formatını kullan:
{
    "anchor_text": "başlık",
    "pre_text": "cümle başlangıcı",
    "post_text": "cümle sonu"
}`;

            const completion = await this.openai.chat.completions.create({
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                model: "gpt-4-0125-preview",
                temperature: 0.7,
                response_format: { type: "json_object" }
            });

            const response = completion.choices[0].message.content;
            if (!response) throw new Error("API yanıt vermedi");

            const linkText = JSON.parse(response);

            // Optimize edilmiş başlığı anchor_text olarak kullan
            return {
                anchor_text: optimizedTitle,
                pre_text: linkText.pre_text,
                post_text: linkText.post_text
            };

        } catch (error) {
            console.error('Link metni üretme hatası:', error);
            return {
                anchor_text: urlData.title || urlData.url.split('/').pop()?.replace(/-/g, ' '),
                pre_text: "Modern dil öğrenim yöntemleri arasında yer alan ",
                post_text: " konusunda uzmanlar hemfikir"
            };
        }
    }

    validateLinkText(linkText: any, urlData: any): boolean {
        if (!linkText?.anchor_text) return false;
        
        const combined_text = `${linkText.pre_text || ''} ${linkText.anchor_text} ${linkText.post_text || ''}`.toLowerCase();
        
        // Temel kontroller
        if (!combined_text || combined_text.length < 10) return false;

        // Link metni uzunluk kontrolü
        const words = linkText.anchor_text.split(/\s+/);
        if (words.length < 2 || words.length > 10) return false;

        // Yasaklı kalıplar
        const bannedPatterns = [
            'tıklayın', 'tıkla', 'buradan', 'burdan',
            'detaylı bilgi', 'daha fazla', 'incele',
            'göz at', 'bakın', 'ziyaret et'
        ];

        // Yasaklı kalıpları kontrol et
        if (bannedPatterns.some(pattern => combined_text.includes(pattern))) {
            return false;
        }

        return true;
    }
}
