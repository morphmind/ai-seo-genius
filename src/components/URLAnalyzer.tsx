import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const URLAnalyzer: React.FC = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!url.trim()) {
      toast({
        title: "Hata",
        description: "Lütfen bir URL girin",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
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
              content: `URL analizi yap: ${url}`
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
      setAnalysis(analysisResult);
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
        <Input
          placeholder="Analiz edilecek URL'yi girin"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <Button 
          className="w-full"
          onClick={handleAnalyze}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analiz Ediliyor...
            </>
          ) : (
            "URL'yi Analiz Et"
          )}
        </Button>
      </div>

      {analysis && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <pre className="text-sm overflow-x-auto">
            {JSON.stringify(analysis, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default URLAnalyzer;