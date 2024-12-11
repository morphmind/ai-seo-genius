import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Provider, Model } from "@/types/content";
import { Button } from "@/components/ui/button";
import ModelSelector from "./ModelSelector";
import TitleInput from "./prompt-generator/TitleInput";
import PromptOutput from "./prompt-generator/PromptOutput";

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
${includeTitle ? `- The title "${title}" should be prominently displayed at the top or bottom of the illustration` : "- Do not include any text or title in the illustration"}

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
      <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
        <ModelSelector 
          provider={provider}
          model={model}
          onProviderChange={setProvider}
          onModelChange={setModel}
        />
      </div>

      <TitleInput value={inputTitle} onChange={setInputTitle} />

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

      {prompt && (
        <div className="space-y-6">
          <PromptOutput
            title="With Title"
            content={prompt}
            onCopy={handleCopy}
            inputTitle={inputTitle}
          />
          <PromptOutput
            title="Without Title"
            content={promptWithoutTitle}
            onCopy={handleCopy}
            inputTitle={inputTitle}
          />
        </div>
      )}
    </div>
  );
};

export default ImagePromptGenerator;