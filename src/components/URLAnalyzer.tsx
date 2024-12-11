import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Download } from "lucide-react";

const USER_AGENTS = [
  "Mozilla/5.0 (compatible; Postman/7.36.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
];

const URLAnalyzer = () => {
  const [urls, setUrls] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const getRandomUserAgent = () => {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
  };

  const fetchUrlContent = async (url: string) => {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': getRandomUserAgent(),
        },
        // SSL sertifika hatalarını yoksay
        mode: 'no-cors'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const text = await response.text();
      return text;
    } catch (error) {
      console.error(`Error fetching URL ${url}:`, error);
      return null;
    }
  };

  const processURLs = async () => {
    if (!urls.trim()) {
      toast({
        title: "Hata",
        description: "Lütfen sitemap URL'lerini girin",
        variant: "destructive",
      });
      return;
    }

    const urlList = urls.split("\n").filter(url => url.trim());
    if (urlList.length === 0) {
      toast({
        title: "Hata",
        description: "Geçerli URL bulunamadı",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    const apiKey = localStorage.getItem("openai_api_key");
    if (!apiKey) {
      toast({
        title: "Hata",
        description: "OpenAI API anahtarı bulunamadı. Lütfen ayarlardan ekleyin.",
        variant: "destructive",
      });
      setIsProcessing(false);
      return;
    }

    const urlDatabase: { [key: string]: any } = {};
    let processedCount = 0;

    try {
      for (const url of urlList) {
        try {
          // URL'nin içeriğini al
          const content = await fetchUrlContent(url);
          if (!content) {
            console.warn(`Skipping ${url} due to fetch error`);
            continue;
          }

          const prompt = `Analyze this URL and its content for SEO purposes:
          URL: ${url}
          Content: ${content.substring(0, 1500)} // İlk 1500 karakter
          
          Please provide:
          1. Main topics (2-3 key subjects)
          2. Important keywords (8-10 relevant terms)
          3. Brief context description
          4. Potential anchor texts (2-3 variations)
          5. Content depth analysis (level and key concepts)
          6. Whether it's a blog post or not
          
          Format the response as a valid JSON object with these exact fields:
          {
            "main_topics": [],
            "keywords": [],
            "context": "",
            "potential_anchor_texts": [],
            "content_depth": {
              "level": "",
              "key_concepts": []
            },
            "is_blog_post": false
          }`;

          const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages: [
                {
                  role: "system",
                  content: "You are an SEO expert. Always respond with valid JSON only, matching the exact structure provided."
                },
                {
                  role: "user",
                  content: prompt
                }
              ],
              temperature: 0.7
            })
          });

          if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`);
          }

          const data = await response.json();
          let analysis;
          
          try {
            // GPT yanıtını parse et
            const content = data.choices[0].message.content;
            analysis = JSON.parse(content.trim());
          } catch (parseError) {
            console.error("JSON parse error:", parseError);
            // Hatalı JSON durumunda boş bir analiz objesi oluştur
            analysis = {
              main_topics: [],
              keywords: [],
              context: "Error analyzing content",
              potential_anchor_texts: [],
              content_depth: {
                level: "unknown",
                key_concepts: []
              },
              is_blog_post: false
            };
          }

          urlDatabase[url] = {
            url,
            analysis,
            analyzed_at: new Date().toISOString()
          };

          processedCount++;
          setProgress((processedCount / urlList.length) * 100);

          // Her URL işleminden sonra kısa bir bekleme ekle
          await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
          console.error(`Error processing URL ${url}:`, error);
          toast({
            title: "Uyarı",
            description: `${url} işlenirken hata oluştu. Diğer URL'lerle devam ediliyor.`,
            variant: "destructive",
          });
        }
      }

      // URL database'ini JSON dosyası olarak indir
      const blob = new Blob([JSON.stringify(urlDatabase, null, 2)], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "url_database.json";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Başarılı",
        description: "URL analizi tamamlandı ve dosya indirildi.",
      });

    } catch (error) {
      console.error("Processing error:", error);
      toast({
        title: "Hata",
        description: "İşlem sırasında bir hata oluştu: " + String(error),
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="urls">Sitemap URL'leri</Label>
              <Textarea
                id="urls"
                placeholder="Her satıra bir URL gelecek şekilde sitemap URL'lerini girin"
                value={urls}
                onChange={(e) => setUrls(e.target.value)}
                className="min-h-[200px]"
                disabled={isProcessing}
              />
            </div>

            {isProcessing && (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-sm text-muted-foreground text-center">
                  {Math.round(progress)}% Tamamlandı
                </p>
              </div>
            )}

            <Button
              className="w-full"
              onClick={processURLs}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  İşleniyor...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  URL'leri İşle ve İndir
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default URLAnalyzer;