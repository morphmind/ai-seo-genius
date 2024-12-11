import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Copy } from "lucide-react";
import { Provider, Model } from "@/types/content";
import ModelSelector from "./ModelSelector";

const ImagePromptGenerator = () => {
  const [inputTitle, setInputTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState<string>("");
  const [provider, setProvider] = useState<Provider>("openai");
  const [model, setModel] = useState<Model>("gpt-4o-mini");
  const { toast } = useToast();

  const generatePromptTemplate = (title: string) => {
    return `Sen blog yazıları için görsel prompt oluşturmada uzman bir asistansın. Aşağıdaki başlık için detaylı bir görsel prompt oluştur:

Başlık: "${title}"

Bu başlık için:
- İllüstrasyon tarzında (gerçekçi veya fotoğrafik değil)
- Sade ve çok karmaşık olmayan
- Başlığın konusunu ve anlamını net bir şekilde temsil eden
- Renk, kompozisyon ve atmosfer detaylarını içeren
- Konuyla alakalı yaratıcı ve ilgi çekici
- Telif hakkı olan karakterler veya öğeler içermeyen

bir görsel için prompt oluştur.

Yanıtını tek bir detaylı paragraf olarak, görselde tam olarak ne olması gerektiğini betimleyerek ver.`;
  };

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
        description: `Lütfen ${provider === "openai" ? "OpenAI" : "Anthropic"} API anahtarınızı ayarlarda belirleyin`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const promptTemplate = generatePromptTemplate(inputTitle);
      console.log("GPT'ye gönderiliyor:", promptTemplate);
      
      // OpenAI API çağrısı yapılacak
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            {
              role: "user",
              content: promptTemplate
            }
          ],
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error("API yanıtı başarısız");
      }

      const data = await response.json();
      const generatedPrompt = data.choices[0].message.content;
      setPrompt(generatedPrompt);
      
    } catch (error) {
      toast({
        title: "Hata",
        description: "Prompt oluşturulamadı. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    toast({
      title: "Başarılı",
      description: "Prompt panoya kopyalandı",
    });
  };

  return (
    <div className="space-y-6">
      <ModelSelector 
        provider={provider}
        model={model}
        onProviderChange={setProvider}
        onModelChange={setModel}
      />

      <div className="space-y-2">
        <Input
          placeholder="Makale başlığınızı girin"
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
            "Görsel Promptu Oluştur"
          )}
        </Button>
      </div>

      {prompt && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="relative">
                <textarea
                  className="w-full min-h-[150px] p-3 rounded-md border"
                  value={prompt}
                  readOnly
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={handleCopy}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ImagePromptGenerator;