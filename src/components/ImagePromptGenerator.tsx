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
  const [promptWithoutTitle, setPromptWithoutTitle] = useState<string>("");
  const [provider, setProvider] = useState<Provider>("openai");
  const [model, setModel] = useState<Model>("gpt-4o-mini");
  const { toast } = useToast();

  const generatePromptTemplate = (title: string, includeTitle: boolean) => {
    return `Create a concise visual prompt (max 800 characters) for an illustration based on this title: "${title}"

Guidelines:
- Illustration style (not realistic/photographic)
- Simple, clear representation of the topic
- Include key visual elements and colors
- No copyrighted elements
- Keep the description focused and brief
${includeTitle ? "" : "- Do not include any text or title in the illustration"}

Respond with a single short paragraph.`;
  };

  const handleGenerate = async () => {
    if (!inputTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title",
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
      // Generate both prompts
      const responses = await Promise.all([
        fetch("https://api.openai.com/v1/chat/completions", {
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
                content: generatePromptTemplate(inputTitle, true)
              }
            ],
            temperature: 0.7
          })
        }),
        fetch("https://api.openai.com/v1/chat/completions", {
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
                content: generatePromptTemplate(inputTitle, false)
              }
            ],
            temperature: 0.7
          })
        })
      ]);

      const [data1, data2] = await Promise.all(responses.map(r => r.json()));
      
      setPrompt(data1.choices[0].message.content);
      setPromptWithoutTitle(data2.choices[0].message.content);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Prompt could not be generated. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
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
            "Generate Visual Prompt"
          )}
        </Button>
      </div>

      {prompt && (
        <>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <h3 className="font-medium">With Title</h3>
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
                    onClick={() => handleCopy(prompt)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <h3 className="font-medium">Without Title</h3>
                <div className="relative">
                  <textarea
                    className="w-full min-h-[150px] p-3 rounded-md border"
                    value={promptWithoutTitle}
                    readOnly
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => handleCopy(promptWithoutTitle)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default ImagePromptGenerator;