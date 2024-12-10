import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface GeneratedContent {
  title: string;
  permalink: string;
  metaDescription: string;
}

const ContentGenerator = () => {
  const [inputTitle, setInputTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<GeneratedContent | null>(null);
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

    const apiKey = localStorage.getItem("openai_api_key");
    if (!apiKey) {
      toast({
        title: "Error",
        description: "Please set your OpenAI API key in settings",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Mock API call for now
      await new Promise(resolve => setTimeout(resolve, 1500));
      setContent({
        title: "How to Optimize Your Website for Search Engines",
        permalink: "optimize-website-search-engines",
        metaDescription: "Learn proven strategies to improve your website's search engine rankings with our comprehensive guide to SEO optimization techniques.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
            "Generate Content"
          )}
        </Button>
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