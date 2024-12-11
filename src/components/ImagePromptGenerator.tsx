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
    return `Generate a detailed image prompt based on this request:

recraft.ai ile "${title}" konu başlıklı blog gönderime featured image oluşturacağım. görsellerimiz belli bir konseptte olacak. illustration olacak. çok karmaşık görseller istemiyorum. konu başlığını net ve temiz bir şekilde anlatan şık görseller istiyorum.

Please provide a detailed image prompt that follows these guidelines and incorporates the title "${title}" appropriately.`;
  };

  const handleGenerate = async () => {
    if (!inputTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter an article title",
        variant: "destructive",
      });
      return;
    }

    const apiKey = provider === "openai" 
      ? localStorage.getItem("openai_api_key")
      : localStorage.getItem("anthropic_api_key");

    if (!apiKey) {
      toast({
        title: "Error",
        description: `Please set your ${provider === "openai" ? "OpenAI" : "Anthropic"} API key in settings`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Here you would make the actual API call to GPT
      // For now, we'll simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // This is where you would normally send the prompt template to GPT
      // and get back a generated image prompt
      // For demonstration, we'll use a mock response
      const promptTemplate = generatePromptTemplate(inputTitle);
      console.log("Sending to GPT:", promptTemplate);
      
      // Mock GPT response - in reality, this would come from the API
      const mockGptResponse = `A clean and elegant illustration for "${inputTitle}", featuring minimalist design elements with a cohesive visual style. The illustration should be simple yet sophisticated, avoiding complex details while clearly conveying the article's theme through carefully chosen visual elements.`;
      
      setPrompt(mockGptResponse);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate prompt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    toast({
      title: "Success",
      description: "Prompt copied to clipboard",
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
          placeholder="Enter your article title"
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
              Generating...
            </>
          ) : (
            "Generate Image Prompt"
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