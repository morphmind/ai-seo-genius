import { ContentAnalyzer } from "@/utils/internal-linking/contentAnalyzer";
import { ContentMatcher } from "@/utils/internal-linking/contentMatcher";
import { useToast } from "@/hooks/use-toast";

interface LinkProcessorProps {
  urlDatabase: File | null;
  articleContent: string;
  linkingMethod: "manual" | "auto";
  manualLinkCount: string;
  onProcessComplete: (links: ProcessedLink[], content: string) => void;
  onProgress: (progress: number) => void;
}

export interface ProcessedLink {
  url: string;
  anchorText: string;
  position: string;
  similarityScore: number;
  paragraph: string;
}

export const useContentProcessor = () => {
  const { toast } = useToast();

  const insertLinks = (content: string, links: ProcessedLink[]): string => {
    let processedContent = content;
    const paragraphs = processedContent.split('\n\n').filter(p => p.trim());
    
    links.forEach(link => {
      const position = parseInt(link.position.split('_')[1]);
      if (position < paragraphs.length) {
        const linkHtml = `<a href="${link.url}" class="internal-link" style="color: var(--primary); text-decoration: underline;">${link.anchorText}</a>`;
        
        // İlgili paragrafta anahtar kelimeyi bul ve linkle değiştir
        const paragraph = paragraphs[position];
        const regex = new RegExp(`\\b${link.anchorText}\\b`, 'i');
        if (regex.test(paragraph)) {
          paragraphs[position] = paragraph.replace(regex, linkHtml);
        }
      }
    });

    return paragraphs.join('\n\n');
  };

  const processContent = async ({
    urlDatabase,
    articleContent,
    linkingMethod,
    manualLinkCount,
    onProcessComplete,
    onProgress,
  }: LinkProcessorProps) => {
    if (!urlDatabase || !articleContent.trim()) {
      toast({
        title: "Hata",
        description: "Lütfen URL database dosyasını ve makale içeriğini girin",
        variant: "destructive",
      });
      return;
    }

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

      onProgress(10);
      const contentAnalyzer = new ContentAnalyzer(apiKey);
      const contentMatcher = new ContentMatcher();

      // URL database'ini oku
      const databaseContent = await urlDatabase.text();
      const urlData = JSON.parse(databaseContent);
      onProgress(30);

      // Makale içeriğini analiz et
      const paragraphs = articleContent.split('\n\n').filter(p => p.trim());
      onProgress(50);
      
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
      onProgress(70);

      // Link önerileri oluştur
      const processedUrls = await contentAnalyzer.extractUrlsWithKeywords(relevantContent);
      onProgress(80);
      
      // Link pozisyonlarını hesapla
      const links: ProcessedLink[] = processedUrls.map((url, index) => {
        const position = Math.min(2 + index * 2, paragraphs.length - 1);
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
      onProgress(90);

      onProcessComplete(links, linkedContent);
      onProgress(100);

      toast({
        description: "İçerik başarıyla linklendi ve rapor oluşturuldu.",
      });

    } catch (error) {
      console.error('İşlem hatası:', error);
      toast({
        title: "Hata",
        description: String(error),
        variant: "destructive",
      });
    }
  };

  return { processContent };
};