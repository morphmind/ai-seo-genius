import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { ContentAnalyzer } from "@/utils/internal-linking/contentAnalyzer";
import { ContentMatcher } from "@/utils/internal-linking/contentMatcher";
import FileUploader from "./internal-linking/FileUploader";
import LinkingMethodSelector from "./internal-linking/LinkingMethodSelector";
import ArticleInput from "./internal-linking/ArticleInput";
import ProcessButton from "./internal-linking/ProcessButton";
import LinkReport from "./internal-linking/LinkReport";

interface ProcessedLink {
  url: string;
  anchorText: string;
  position: string;
  similarityScore: number;
  paragraph: string;
}

const InternalLinkGenerator = () => {
  const [urlDatabase, setUrlDatabase] = useState<File | null>(null);
  const [articleContent, setArticleContent] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [linkingMethod, setLinkingMethod] = useState<"manual" | "auto">("manual");
  const [manualLinkCount, setManualLinkCount] = useState("3");
  const [processedLinks, setProcessedLinks] = useState<ProcessedLink[]>([]);
  const [processedContent, setProcessedContent] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const insertLinks = (content: string, links: ProcessedLink[]): string => {
    let processedHtml = content;
    const paragraphs = processedHtml.split('\n\n').filter(p => p.trim());
    
    links.forEach(link => {
      const position = parseInt(link.position.split('_')[1]);
      if (position < paragraphs.length) {
        const linkHtml = `
          <div class="related-content" style="margin: 20px 0; padding: 15px; background-color: var(--background); border-left: 3px solid var(--primary); border-radius: 3px; font-style: italic;">
            <a href="${link.url}" style="color: var(--primary); text-decoration: none; font-weight: 500;">
              ${link.anchorText}
            </a>
          </div>
        `;
        paragraphs[position] = `${paragraphs[position]}\n${linkHtml}`;
      }
    });

    return paragraphs.join('\n\n');
  };

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
    setProgress(0);

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
      setProgress(10);
      const databaseContent = await urlDatabase.text();
      const urlData = JSON.parse(databaseContent);
      setProgress(20);

      // Makale içeriğini analiz et
      const paragraphs = articleContent.split('\n\n').filter(p => p.trim());
      setProgress(30);
      
      // İlgili içerikleri bul
      const maxLinks = linkingMethod === "manual" ? parseInt(manualLinkCount) : Math.floor(articleContent.length / 500);
      setProgress(40);
      
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
      setProgress(60);

      // Link önerileri oluştur
      const processedUrls = await contentAnalyzer.extractUrlsWithKeywords(relevantContent);
      setProgress(80);
      
      // Link pozisyonlarını hesapla ve linkleri ekle
      const links: ProcessedLink[] = processedUrls.map((url, index) => {
        const position = Math.min(3 + index * 2, paragraphs.length - 1);
        return {
          url: url.url,
          anchorText: url.keyword,
          position: `paragraph_${position}`,
          similarityScore: url.similarity,
          paragraph: paragraphs[position]
        };
      });

      // Linkleri içeriğe ekle
      const linkedContent = insertLinks(articleContent, links);
      setProcessedContent(linkedContent);
      setProcessedLinks(links);
      setProgress(90);

      // İşlenmiş makaleyi indir
      const blob = new Blob([linkedContent], { type: "text/html" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "makale_linked.txt";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setProgress(100);

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

            {isProcessing && (
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-muted-foreground text-center">
                  İşleniyor... ({progress}%)
                </p>
              </div>
            )}

            <ProcessButton
              onClick={processContent}
              isProcessing={isProcessing}
            />
          </div>
        </CardContent>
      </Card>

      {processedLinks.length > 0 && (
        <LinkReport links={processedLinks} content={processedContent} />
      )}
    </div>
  );
};

export default InternalLinkGenerator;