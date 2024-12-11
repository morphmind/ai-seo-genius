import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
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
}

const InternalLinkGenerator = () => {
  const [urlDatabase, setUrlDatabase] = useState<File | null>(null);
  const [articleContent, setArticleContent] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [linkingMethod, setLinkingMethod] = useState<"manual" | "auto">("manual");
  const [manualLinkCount, setManualLinkCount] = useState("3");
  const [processedLinks, setProcessedLinks] = useState<ProcessedLink[]>([]);
  const [processedContent, setProcessedContent] = useState<string>("");
  const { toast } = useToast();

  const insertLinks = (content: string, links: ProcessedLink[]): string => {
    let processedHtml = content;
    const parser = new DOMParser();
    const doc = parser.parseFromString(processedHtml, 'text/html');
    
    links.forEach(link => {
      const paragraphs = doc.getElementsByTagName('p');
      const position = parseInt(link.position.split('_')[1]);
      
      if (paragraphs[position]) {
        const linkContainer = doc.createElement('div');
        linkContainer.className = 'related-content';
        linkContainer.style.cssText = `
          margin: 20px 0;
          padding: 15px;
          background-color: #f8f9fa;
          border-left: 3px solid #7952b3;
          border-radius: 3px;
          font-style: italic;
          color: #555;
        `;

        const linkElement = doc.createElement('a');
        linkElement.href = link.url;
        linkElement.textContent = link.anchorText;
        linkElement.style.cssText = `
          color: #7952b3;
          text-decoration: none;
          font-weight: 500;
        `;

        linkContainer.appendChild(linkElement);
        paragraphs[position].parentNode?.insertBefore(linkContainer, paragraphs[position].nextSibling);
      }
    });

    return doc.body.innerHTML;
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
      const processedUrls = await contentAnalyzer.extractUrlsWithKeywords(relevantContent);
      
      // Link pozisyonlarını hesapla ve linkleri ekle
      const links: ProcessedLink[] = processedUrls.map((url, index) => ({
        url: url.url,
        anchorText: url.keyword,
        position: `paragraph_${Math.min(3 + index * 2, paragraphs.length - 1)}`,
        similarityScore: url.similarity
      }));

      // Linkleri içeriğe ekle
      const linkedContent = insertLinks(articleContent, links);
      setProcessedContent(linkedContent);
      setProcessedLinks(links);

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

      {processedLinks.length > 0 && (
        <LinkReport links={processedLinks} content={processedContent} />
      )}
    </div>
  );
};

export default InternalLinkGenerator;