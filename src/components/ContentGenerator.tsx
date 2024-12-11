import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { GeneratedContent, Provider, Model, ContentType } from "@/types/content";
import { generateSEOPrompt, generateFAQPrompt, parseAIResponse } from "@/utils/prompts";
import ModelSelector from "./ModelSelector";
import ContentDisplay from "./ContentDisplay";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const ContentGenerator = () => {
  const [inputTitle, setInputTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [provider, setProvider] = useState<Provider>("openai");
  const [model, setModel] = useState<Model>("gpt-4o-mini");
  const [inputLanguage, setInputLanguage] = useState<"tr" | "en">("tr");
  const [outputLanguage, setOutputLanguage] = useState<"tr" | "en">("tr");
  const [contentType, setContentType] = useState<ContentType>("seo");
  const [includeFAQ, setIncludeFAQ] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!inputTitle.trim()) {
      toast({
        title: "Hata",
        description: "Lütfen bir başlık girin",
        variant: "destructive",
      });
      return;
    }

    const apiKey = provider === "openai" 
      ? localStorage.getItem("openai_api_key")
      : localStorage.getItem("anthropic_api_key");

    if (!apiKey) {
      toast({
        title: "Hata",
        description: `Lütfen ${provider === "openai" ? "OpenAI" : "Anthropic"} API anahtarınızı ayarlarda belirtin`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const seoPrompt = generateSEOPrompt(inputTitle, inputLanguage, outputLanguage);
      const faqPrompt = includeFAQ ? generateFAQPrompt(inputTitle, inputLanguage, outputLanguage) : null;
      
      const prompts = [
        {
          role: "system",
          content: "You are an SEO expert. Always respond with valid JSON only."
        },
        {
          role: "user",
          content: seoPrompt
        }
      ];

      if (faqPrompt) {
        prompts.push({
          role: "user",
          content: faqPrompt
        });
      }

      if (provider === "openai") {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: model,
            messages: prompts,
            temperature: 0.7
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || "İçerik oluşturulamadı");
        }

        const data = await response.json();
        const generatedContent = parseAIResponse(data.choices[0].message.content);
        setContent(generatedContent);
      } else {
        toast({
          title: "Bilgi",
          description: "Anthropic API entegrasyonu yakında gelecek",
        });
      }
    } catch (error) {
      console.error("Generation error:", error);
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "İçerik oluşturulamadı. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <ModelSelector 
          provider={provider}
          model={model}
          onProviderChange={setProvider}
          onModelChange={setModel}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>İçerik Türü</Label>
            <Select value={contentType} onValueChange={(value: ContentType) => setContentType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="İçerik türü seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="seo">Makale Ögeleri</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Giriş Dili</Label>
            <Select value={inputLanguage} onValueChange={(value: "tr" | "en") => setInputLanguage(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tr">Türkçe</SelectItem>
                <SelectItem value="en">İngilizce</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Çıkış Dili</Label>
            <Select value={outputLanguage} onValueChange={(value: "tr" | "en") => setOutputLanguage(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tr">Türkçe</SelectItem>
                <SelectItem value="en">İngilizce</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="faq-mode"
            checked={includeFAQ}
            onCheckedChange={setIncludeFAQ}
          />
          <Label htmlFor="faq-mode">FAQ Ekle</Label>
        </div>

        <div className="space-y-2">
          <Label>Makale Başlığı</Label>
          <Input
            placeholder={`Başlığı ${inputLanguage === "tr" ? "Türkçe" : "İngilizce"} girin`}
            value={inputTitle}
            onChange={(e) => setInputTitle(e.target.value)}
          />
          <Button 
            className="w-full"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Oluşturuluyor...
              </>
            ) : (
              "İçerik Oluştur"
            )}
          </Button>
        </div>
      </div>

      <ContentDisplay content={content} includeFAQ={includeFAQ} />
    </div>
  );
};

export default ContentGenerator;