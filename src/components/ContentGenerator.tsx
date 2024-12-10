import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface GeneratedContent {
  title: string;
  permalink: string;
  metaDescription: string;
}

type Provider = "openai" | "anthropic";
type Model = "gpt-4" | "gpt-4-turbo" | "gpt-3.5-turbo" | "gpt-4o" | "gpt-4o-mini" | "claude-3-opus" | "claude-3-sonnet" | "claude-3-haiku";

const ContentGenerator = () => {
  const [inputTitle, setInputTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [provider, setProvider] = useState<Provider>("openai");
  const [model, setModel] = useState<Model>("gpt-4o");
  const { toast } = useToast();

  const getAvailableModels = (provider: Provider): Model[] => {
    if (provider === "openai") {
      return ["gpt-4o", "gpt-4o-mini", "gpt-4", "gpt-4-turbo", "gpt-3.5-turbo"];
    }
    return ["claude-3-opus", "claude-3-sonnet", "claude-3-haiku"];
  };

  const handleProviderChange = (value: Provider) => {
    setProvider(value);
    setModel(getAvailableModels(value)[0]);
  };

  const generatePrompt = (title: string) => {
    return `As an SEO expert, generate optimized content for an article titled "${title}". Please provide:

1. An SEO-optimized title (max 55 characters)
2. A URL-friendly permalink
3. A compelling meta description (max 155 characters)

Format the response as JSON with these exact keys: title, permalink, metaDescription.
Make sure the content is engaging, relevant to the topic, and optimized for search engines.`;
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
      const prompt = generatePrompt(inputTitle);
      
      if (provider === "openai") {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: "system",
                content: "You are an SEO expert who generates optimized content."
              },
              {
                role: "user",
                content: prompt
              }
            ],
            temperature: 0.7
          })
        });

        if (!response.ok) {
          throw new Error("Failed to generate content");
        }

        const data = await response.json();
        const generatedContent = JSON.parse(data.choices[0].message.content);
        setContent(generatedContent);
      } else {
        // Anthropic API implementation would go here
        toast({
          title: "Info",
          description: "Anthropic API integration coming soon",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate content. Please try again.",
        variant: "destructive",
      });
      console.error("Generation error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>AI Provider</Label>
            <Select value={provider} onValueChange={(value: Provider) => handleProviderChange(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="anthropic">Anthropic</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Model</Label>
            <Select value={model} onValueChange={(value: Model) => setModel(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {getAvailableModels(provider).map((modelOption) => (
                  <SelectItem key={modelOption} value={modelOption}>
                    {modelOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Article Title</Label>
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
              "Generate Content"
            )}
          </Button>
        </div>
      </div>

      {content && (
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Label>SEO Title ({content.title.length}/55 characters)</Label>
                <Input value={content.title} readOnly />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Label>Permalink</Label>
                <Input value={content.permalink} readOnly />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Label>Meta Description ({content.metaDescription.length}/155 characters)</Label>
                <textarea
                  className="w-full min-h-[100px] p-3 rounded-md border"
                  value={content.metaDescription}
                  readOnly
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ContentGenerator;