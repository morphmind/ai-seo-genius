import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ContentAnalyzer } from "@/utils/internal-linking/contentAnalyzer";
import { ContentMatcher } from "@/utils/internal-linking/contentMatcher";
import FileUploader from "./internal-linking/FileUploader";
import LinkingMethodSelector from "./internal-linking/LinkingMethodSelector";
import ArticleInput from "./internal-linking/ArticleInput";
import ProcessButton from "./internal-linking/ProcessButton";

const InternalLinkGenerator = () => {
  const [urlDatabase, setUrlDatabase] = useState<File | null>(null);
  const [articleContent, setArticleContent] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [linkingMethod, setLinkingMethod] = useState<"manual" | "auto">("manual");
  const [manualLinkCount, setManualLinkCount] = useState("3");
  const { toast } = useToast();

  const processContent = async () => {
    if (!urlDatabase || !articleContent.trim()) {
      toast({
        title: "Hata",
        description: "Lütfen URL database dosyasını ve makale içeriğini girin",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const apiKey = localStorage.getItem("openai_api_key");
      if (!apiKey) {
        toast({
          title: "Hata",
          description: "Lütfen OpenAI API anahtarınızı ayarlarda belirtin",
          variant: "destructive",
        });
        return;
      }

      const contentAnalyzer = new ContentAnalyzer(apiKey);
      const contentMatcher = new ContentMatcher();

      // URL database'ini oku
      const databaseContent = await urlDatabase.text();
      const urlData = JSON.parse(databaseContent);

      // Makale içeriğini analiz et
      const paragraphs = await contentAnalyzer.analyzeParagraphs(articleContent);
      
      // İlgili içerikleri bul
      const maxLinks = linkingMethod === "manual" ? parseInt(manualLinkCount) : Math.floor(articleContent.length / 500);
      const relevantContent = contentMatcher.findRelevantContent(
        {
          main_topics: [],
          keywords: [],
          context: articleContent,
          content_type: "article",
          key_concepts: [],
          secondary_topics: []
        },
        urlData,
        maxLinks
      );

      // Link önerileri oluştur
      const processedUrls = contentAnalyzer.extractUrlsWithKeywords(relevantContent);
      
      // İşlenmiş makaleyi indir
      const blob = new Blob([JSON.stringify(processedUrls, null, 2)], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "processed_article.json";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        description: "İşlem tamamlandı ve sonuçlar indirildi.",
      });

    } catch (error) {
      console.error('İşlem hatası:', error);
      toast({
        title: "Hata",
        description: String(error),
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <FileUploader 
              onFileUpload={setUrlDatabase}
              urlDatabase={urlDatabase}
            />

            <LinkingMethodSelector
              linkingMethod={linkingMethod}
              manualLinkCount={manualLinkCount}
              onMethodChange={setLinkingMethod}
              onCountChange={setManualLinkCount}
            />

            <ArticleInput
              value={articleContent}
              onChange={setArticleContent}
            />

            <ProcessButton
              onClick={processContent}
              isProcessing={isProcessing}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InternalLinkGenerator;