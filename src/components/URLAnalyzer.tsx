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

const CORS_PROXIES = [
  "https://api.allorigins.win/raw?url=",
  "https://corsproxy.io/?",
  "https://cors-anywhere.herokuapp.com/"
];

const URLAnalyzer = () => {
  const [urls, setUrls] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const getRandomUserAgent = () => {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
  };

  const parseXMLSitemap = (xmlText: string): string[] => {
    const urls: string[] = [];
    const matches = xmlText.match(/<loc>([^<]+)<\/loc>/g);
    
    if (matches) {
      matches.forEach(match => {
        const url = match.replace(/<\/?loc>/g, '');
        urls.push(url);
      });
    }
    
    return urls;
  };

  const fetchWithProxy = async (url: string, proxyUrl: string) => {
    const response = await fetch(`${proxyUrl}${encodeURIComponent(url)}`, {
      headers: {
        'User-Agent': getRandomUserAgent(),
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.text();
  };

  const fetchUrlContent = async (url: string) => {
    console.log(`Attempting to fetch: ${url}`);
    
    // Try each proxy in sequence
    for (const proxyUrl of CORS_PROXIES) {
      try {
        console.log(`Trying proxy: ${proxyUrl}`);
        const content = await fetchWithProxy(url, proxyUrl);
        console.log(`Successfully fetched content with ${proxyUrl}, length: ${content.length}`);
        return content;
      } catch (error) {
        console.warn(`Proxy ${proxyUrl} failed:`, error);
        continue;
      }
    }

    // If all proxies fail, try direct fetch as last resort
    try {
      console.log('Attempting direct fetch...');
      const response = await fetch(url, {
        headers: {
          'User-Agent': getRandomUserAgent(),
        },
        mode: 'no-cors',
      });
      
      const text = await response.text();
      console.log(`Direct fetch successful, content length: ${text.length}`);
      return text;
    } catch (error) {
      console.error('Direct fetch failed:', error);
      throw new Error(`Failed to fetch ${url} with all methods`);
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
      for (const sitemapUrl of urlList) {
        try {
          console.log(`Processing sitemap: ${sitemapUrl}`);
          const sitemapContent = await fetchUrlContent(sitemapUrl);
          
          if (!sitemapContent) {
            console.warn(`No content received for sitemap ${sitemapUrl}`);
            continue;
          }

          const pageUrls = parseXMLSitemap(sitemapContent);
          console.log(`Found ${pageUrls.length} URLs in sitemap`);

          for (const pageUrl of pageUrls) {
            try {
              console.log(`Fetching page content: ${pageUrl}`);
              const pageContent = await fetchUrlContent(pageUrl);

              if (!pageContent) {
                console.warn(`No content received for ${pageUrl}`);
                continue;
              }

              const prompt = `Analyze this URL and its content for SEO purposes:
              URL: ${pageUrl}
              Content: ${pageContent.substring(0, 1500)}
              
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
                const content = data.choices[0].message.content;
                analysis = JSON.parse(content.trim());
              } catch (parseError) {
                console.error("JSON parse error:", parseError);
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

              urlDatabase[pageUrl] = {
                url: pageUrl,
                analysis,
                analyzed_at: new Date().toISOString()
              };

              processedCount++;
              setProgress((processedCount / pageUrls.length) * 100);

              // Add delay between requests
              await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (pageError) {
              console.error(`Error processing page ${pageUrl}:`, pageError);
            }
          }
        } catch (sitemapError) {
          console.error(`Error processing sitemap ${sitemapUrl}:`, sitemapError);
          toast({
            title: "Uyarı",
            description: `${sitemapUrl} işlenirken hata oluştu. Diğer URL'lerle devam ediliyor.`,
            variant: "destructive",
          });
        }
      }

      if (Object.keys(urlDatabase).length === 0) {
        throw new Error("No URLs were successfully processed");
      }

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