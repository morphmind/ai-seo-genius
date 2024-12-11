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
    return `You are an expert at creating detailed image prompts for blog post featured images. 
    
Title: "${title}"

Create a detailed, specific image prompt for an illustration that will be used as the featured image for this blog post.
The image should:
- Be an illustration style (not realistic or photographic)
- Be clean and not too complex
- Clearly represent the topic and meaning of the title
- Include specific details about elements, colors, composition, and mood
- Be creative and engaging while staying relevant to the topic
- Not use any copyrighted characters or elements

Format your response as a single, detailed paragraph describing exactly what should be in the illustration.`;
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
      const promptTemplate = generatePromptTemplate(inputTitle);
      console.log("Sending to GPT:", promptTemplate);
      
      // Here we would make the actual API call to GPT
      // For demonstration, we'll simulate a more contextual response
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // This is a mock response - in production, this would come from the API
      let mockResponse = "";
      if (inputTitle.toLowerCase().includes("ingilizce") && inputTitle.toLowerCase().includes("çizgi film")) {
        mockResponse = `A playful and inviting illustration highlighting cartoons as a fun way to learn English. The design features a TV screen with colorful cartoon characters (generic and not copyrighted) speaking in speech bubbles that include simple English words or phrases like 'Hello!' or 'How are you?'. Surround the TV with books, headphones, and a globe to emphasize learning and global communication. Use bright, cheerful colors like yellow, red, and blue to create a lively and engaging atmosphere.`;
      } else {
        mockResponse = `An engaging illustration related to "${inputTitle}" that captures the essence of the topic through carefully chosen visual elements. The design should incorporate relevant symbols and metaphors, using a cohesive color palette that matches the topic's mood. Include specific details that relate to the subject matter while maintaining a clean, uncluttered composition.`;
      }
      
      setPrompt(mockResponse);
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