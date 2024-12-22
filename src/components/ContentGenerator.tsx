import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { GeneratedContent, Provider, Model } from "@/types/content";
import { generateSEOPrompt, generateFAQPrompt, parseAIResponse } from "@/utils/prompts";
import ModelSelector from "./ModelSelector";
import ContentDisplay from "./ContentDisplay";
import ContentIdeas from "./ContentIdeas";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ContentGenerator = () => {
  const [inputTitle, setInputTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [provider, setProvider] = useState<Provider>("openai");
  const [model, setModel] = useState<Model>("gpt-4o-mini");
  const [inputLanguage, setInputLanguage] = useState<"tr" | "en">("tr");
  const [outputLanguage, setOutputLanguage] = useState<"tr" | "en">("tr");
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
      const faqPrompt = includeFAQ ? generateFAQPrompt(inputTitle, inputLanguage, outputLanguage, "text") : null;
      
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
        const generatedContent = parseAIResponse(data.choices[0].message.content, includeFAQ);
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
      <Tabs defaultValue="generator" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generator">SEO Optimizasyonu</TabsTrigger>
          <TabsTrigger value="ideas">Content Ideas</TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="space-y-6 mt-6">
          <div className="space-y-4">
            <ModelSelector 
              provider={provider}
              model={model}
              onProviderChange={setProvider}
              onModelChange={setModel}
            />
            
            <div className="space-y-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Label className="whitespace-nowrap">Giriş Dili:</Label>
                  <RadioGroup
                    value={inputLanguage}
                    onValueChange={(value: "tr" | "en") => setInputLanguage(value)}
                    className="flex gap-3"
                  >
                    <div className="flex items-center gap-1.5">
                      <RadioGroupItem value="tr" id="input-tr" />
                      <Label htmlFor="input-tr" className="cursor-pointer">TR</Label>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <RadioGroupItem value="en" id="input-en" />
                      <Label htmlFor="input-en" className="cursor-pointer">EN</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="flex items-center gap-2">
                  <Label className="whitespace-nowrap">Çıkış Dili:</Label>
                  <RadioGroup
                    value={outputLanguage}
                    onValueChange={(value: "tr" | "en") => setOutputLanguage(value)}
                    className="flex gap-3"
                  >
                    <div className="flex items-center gap-1.5">
                      <RadioGroupItem value="tr" id="output-tr" />
                      <Label htmlFor="output-tr" className="cursor-pointer">TR</Label>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <RadioGroupItem value="en" id="output-en" />
                      <Label htmlFor="output-en" className="cursor-pointer">EN</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="flex items-center gap-2">
                  <Label htmlFor="faq-mode" className="cursor-pointer">FAQ</Label>
                  <Switch
                    id="faq-mode"
                    checked={includeFAQ}
                    onCheckedChange={setIncludeFAQ}
                  />
                </div>
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
                      İçerik Oluşturuluyor...
                    </>
                  ) : (
                    'İçerik Oluştur'
                  )}
                </Button>
              </div>
            </div>
          </div>

          {content && <ContentDisplay content={content} includeFAQ={includeFAQ} />}
        </TabsContent>

        <TabsContent value="ideas" className="mt-6">
          <ContentIdeas />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentGenerator;
