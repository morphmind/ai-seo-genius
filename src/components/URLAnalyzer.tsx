import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Download } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const URLAnalyzer: React.FC = () => {
  const [urls, setUrls] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
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

  const analyzeUrls = async () => {
    if (!urls.trim()) {
      toast({
        title: "Hata",
        description: "Lütfen en az bir URL girin",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const urlList = urls.split("\n").filter(url => url.trim());
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

      for (const url of urlList) {
        try {
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
                  content: "Sen bir SEO uzmanısın. Yanıtları sadece Türkçe olarak ver ve SADECE geçerli JSON formatında, markdown veya backtick kullanmadan döndür."
                },
                {
                  role: "user",
                  content: `Aşağıdaki URL'yi analiz et ve şu formatta yanıt ver:
                  {
                    "main_topics": ["ana_konu_1", "ana_konu_2"],
                    "keywords": ["anahtar1", "anahtar2", "anahtar3"],
                    "context": "içeriğin genel bağlamı",
                    "content_type": "article|tutorial|info|review",
                    "key_concepts": ["kavram1", "kavram2"],
                    "secondary_topics": ["yan_konu_1", "yan_konu_2"]
                  }
                  
                  URL: ${url.trim()}`
                }
              ],
              temperature: 0.7
            })
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || "URL analizi yapılamadı");
          }

          const data = await response.json();
          const analysisResult = JSON.parse(data.choices[0].message.content);
          
          results[url.trim()] = {
            url: url.trim(),
            analysis: analysisResult,
            analyzed_at: new Date().toISOString()
          };

          // Her başarılı analiz sonrası state'i güncelle
          setAnalysis(results);
        } catch (error) {
          console.error(`Error analyzing ${url}:`, error);
          results[url.trim()] = {
            url: url.trim(),
            error: error instanceof Error ? error.message : "URL analizi yapılamadı",
            analyzed_at: new Date().toISOString()
          };
        }
      }

      // Tüm analizler tamamlandığında
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
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>URL Analizi</Label>
        <Textarea
          placeholder="Analiz edilecek URL'leri her satıra bir tane gelecek şekilde girin"
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
              "URL'leri Analiz Et"
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