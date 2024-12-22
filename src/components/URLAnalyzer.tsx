import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Download } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { extractUrlsFromSitemap } from "@/utils/sitemapParser";
import { analyzeUrl } from "@/utils/urlAnalyzer";

const URLAnalyzer: React.FC = () => {
  const [urls, setUrls] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const { toast } = useToast();

  const downloadResults = () => {
    if (!analysis) return;

    const blob = new Blob([JSON.stringify(analysis, null, 2)], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `url_analysis_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const calculateTimeRemaining = (current: number, total: number, elapsedTime: number) => {
    if (current === 0) return "Hesaplanıyor...";
    const timePerUrl = elapsedTime / current;
    const remainingUrls = total - current;
    const remainingSeconds = Math.round(timePerUrl * remainingUrls / 1000);
    
    if (remainingSeconds < 60) {
      return `${remainingSeconds} saniye`;
    } else {
      const minutes = Math.floor(remainingSeconds / 60);
      const seconds = remainingSeconds % 60;
      return `${minutes} dakika ${seconds} saniye`;
    }
  };

  const analyzeUrls = async () => {
    if (!urls.trim()) {
      toast({
        title: "Hata",
        description: "Lütfen en az bir sitemap URL'si girin",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setProgress(0);
    const startTime = Date.now();
    const sitemapUrls = urls.split("\n").filter(url => url.trim());
    const results: { [key: string]: any } = {};

    try {
      const apiKey = localStorage.getItem("openai_api_key");
      if (!apiKey) {
        toast({
          title: "Hata",
          description: "Lütfen OpenAI API anahtarınızı ayarlarda belirtin",
          variant: "destructive",
        });
        return;
      }

      // Extract URLs from all sitemaps
      let allUrls: string[] = [];
      for (let i = 0; i < sitemapUrls.length; i++) {
        const sitemapUrl = sitemapUrls[i].trim();
        const extractedUrls = await extractUrlsFromSitemap(sitemapUrl);
        allUrls = [...allUrls, ...extractedUrls];
      }

      // Remove duplicates
      allUrls = [...new Set(allUrls)];

      // Analyze each URL
      for (let i = 0; i < allUrls.length; i++) {
        const url = allUrls[i];
        try {
          const analysisResult = await analyzeUrl(url, apiKey);
          
          results[url] = {
            url,
            analysis: analysisResult,
            analyzed_at: new Date().toISOString()
          };

          // Progress ve kalan süre hesaplama
          const currentProgress = ((i + 1) / allUrls.length) * 100;
          setProgress(currentProgress);
          const elapsedTime = Date.now() - startTime;
          const remaining = calculateTimeRemaining(i + 1, allUrls.length, elapsedTime);
          setTimeRemaining(remaining);

          // Her başarılı analiz sonrası state'i güncelle
          setAnalysis(results);
        } catch (error) {
          console.error(`Error analyzing ${url}:`, error);
          results[url] = {
            url,
            error: error instanceof Error ? error.message : "URL analizi yapılamadı",
            analyzed_at: new Date().toISOString()
          };
        }
      }

      toast({
        description: "URL analizleri tamamlandı",
      });
      
      // Otomatik indirme başlat
      downloadResults();

    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "URL analizi yapılamadı. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setProgress(0);
      setTimeRemaining("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Sitemap URL Analizi</Label>
        <Textarea
          placeholder="Analiz edilecek sitemap URL'lerini her satıra bir tane gelecek şekilde girin"
          value={urls}
          onChange={(e) => setUrls(e.target.value)}
          className="min-h-[200px]"
        />
        <div className="flex gap-2">
          <Button 
            className="flex-1"
            onClick={analyzeUrls}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analiz Ediliyor...
              </>
            ) : (
              "Sitemap'leri Analiz Et"
            )}
          </Button>
          {analysis && (
            <Button
              variant="outline"
              onClick={downloadResults}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Sonuçları İndir
            </Button>
          )}
        </div>

        {loading && (
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground text-center">
              İşleniyor... ({Math.round(progress)}%) - Tahmini kalan süre: {timeRemaining}
            </p>
          </div>
        )}
      </div>

      {analysis && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg dark:bg-gray-800">
          <pre className="text-sm overflow-x-auto">
            {JSON.stringify(analysis, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default URLAnalyzer;
