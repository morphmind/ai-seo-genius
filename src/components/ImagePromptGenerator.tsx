import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Provider, Model } from "@/types/content";
import { Button } from "@/components/ui/button";
import ModelSelector from "./ModelSelector";
import TitleInput from "./prompt-generator/TitleInput";
import PromptOutput from "./prompt-generator/PromptOutput";
import { Card } from "@/components/ui/card";

interface ImageGenerationResponse {
  images: Array<{
    url: string;
  }>;
}

const ImagePromptGenerator = () => {
  const [inputTitle, setInputTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState<string>("");
  const [promptWithoutTitle, setPromptWithoutTitle] = useState<string>("");
  const [provider, setProvider] = useState<Provider>("openai");
  const [model, setModel] = useState<Model>("gpt-4o-mini");
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
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

  const generateImages = async (promptText: string) => {
    const apiKey = localStorage.getItem("recraft_api_key");
    if (!apiKey) {
      toast({
        title: "Error",
        description: "Please set your Recraft API key in settings",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("https://api.recraft.ai/v2/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          prompt: promptText,
          negative_prompt: "text, words, letters, numbers, watermark, signature",
          model: "recraft-v2",
          width: 768,
          height: 512,
          steps: 30,
          guidance_scale: 7.5,
          seed: Math.floor(Math.random() * 1000000),
          scheduler: "dpm++2m-karras",
          num_images: 4
        })
      });

      if (!response.ok) {
        throw new Error('Image generation failed');
      }

      const data: ImageGenerationResponse = await response.json();
      return data.images.map(img => img.url);
    } catch (error) {
      console.error('Error generating images:', error);
      toast({
        title: "Error",
        description: "Failed to generate images. Please try again.",
        variant: "destructive",
      });
      return null;
    }
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

  const handleGenerateImages = async (promptText: string) => {
    setLoading(true);
    try {
      const images = await generateImages(promptText);
      if (images) {
        setGeneratedImages(images);
      }
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

  const downloadImage = async (url: string) => {
    try {
      const response = await fetch(url, {
        mode: 'cors',
        credentials: 'omit'
      });
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = `generated-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error('Error downloading image:', error);
      toast({
        title: "Error",
        description: "Failed to download image",
        variant: "destructive",
      });
    }
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
            onGenerateImage={() => handleGenerateImages(prompt)}
          />
          <PromptOutput
            title="Without Title"
            content={promptWithoutTitle}
            onCopy={handleCopy}
            inputTitle={inputTitle}
            onGenerateImage={() => handleGenerateImages(promptWithoutTitle)}
          />
        </div>
      )}

      {generatedImages.length > 0 && (
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Generated Images</h3>
          <div className="grid grid-cols-2 gap-4">
            {generatedImages.map((imageUrl, index) => (
              <div key={index} className="relative group">
                <img
                  src={imageUrl}
                  alt={`Generated image ${index + 1}`}
                  className="w-full h-auto rounded-lg"
                  crossOrigin="anonymous"
                />
                <Button
                  onClick={() => downloadImage(imageUrl)}
                  className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  variant="secondary"
                  size="sm"
                >
                  Download
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default ImagePromptGenerator;
