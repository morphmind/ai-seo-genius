import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Download } from "lucide-react";

const URLAnalyzer = () => {
  const [urls, setUrls] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

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
          const prompt = `Analyze this URL and its content for SEO purposes: ${url}
          
          Please provide:
          1. Main topics (2-3 key subjects)
          2. Important keywords (8-10 relevant terms)
          3. Brief context description
          4. Potential anchor texts (2-3 variations)
          5. Content depth analysis (level and key concepts)
          6. Whether it's a blog post or not
          
          Format the response as a valid JSON object.`;

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
                  content: "You are an SEO expert. Always respond with valid JSON only."
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
          const analysis = JSON.parse(data.choices[0].message.content);

          urlDatabase[url] = {
            url,
            analysis,
            analyzed_at: new Date().toISOString()
          };

          processedCount++;
          setProgress((processedCount / urlList.length) * 100);

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
      const blob = new Blob([JSON.stringify(urlDatabase, null, 4)], { type: "application/json" });
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