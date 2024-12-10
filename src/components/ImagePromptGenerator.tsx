import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Copy } from "lucide-react";

const ImagePromptGenerator = () => {
  const [inputTitle, setInputTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState<string>("");
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!inputTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter an article title",
        variant: "destructive",
      });
      return;
    }

    const apiKey = localStorage.getItem("anthropic_api_key");
    if (!apiKey) {
      toast({
        title: "Error",
        description: "Please set your Anthropic API key in settings",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Mock API call for now
      await new Promise(resolve => setTimeout(resolve, 1500));
      setPrompt("A minimalist illustration of a computer screen displaying SEO metrics and analytics, using a clean design style with blue and white color scheme, featuring simple geometric shapes and clear data visualization elements.");
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