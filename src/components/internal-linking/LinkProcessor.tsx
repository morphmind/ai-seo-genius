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
    if (!links.length) {
      console.log("No links to insert");
      return content;
    }

    let processedContent = content;
    const paragraphs = processedContent.split('\n\n').filter(p => p.trim());
    console.log("Paragraphs count:", paragraphs.length);
    const updatedParagraphs = [...paragraphs];
    
    links.forEach(link => {
      const position = parseInt(link.position.split('_')[1]);
      console.log("Processing link:", link, "at position:", position);
      
      if (position < paragraphs.length) {
        const paragraph = paragraphs[position];
        const linkHtml = `<a href="${link.url}" class="internal-link" style="color: var(--primary); text-decoration: underline;">${link.anchorText}</a>`;
        
        const regex = new RegExp(`(${link.anchorText})`, 'gi');
        if (regex.test(paragraph)) {
          updatedParagraphs[position] = paragraph.replace(regex, linkHtml);
          console.log("Link inserted successfully");
        } else {
          console.log("Anchor text not found in paragraph");
        }
      } else {
        console.log("Position out of bounds");
      }
    });

    return updatedParagraphs.join('\n\n');
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
      console.log("İşlem başladı: URL database ve içerik okunuyor");

      const databaseContent = await urlDatabase.text();
      const urlData = JSON.parse(databaseContent);
      onProgress(20);
      console.log("URL database okundu:", urlData.length, "URL bulundu");

      const paragraphs = articleContent.split('\n\n').filter(p => p.trim());
      onProgress(30);
      console.log("Makale", paragraphs.length, "paragrafa ayrıldı");

      const contentAnalyzer = new ContentAnalyzer(apiKey);
      const contentMatcher = new ContentMatcher();
      
      onProgress(40);
      console.log("İçerik analizi başladı");
      const analysis = await contentAnalyzer.analyzeContent(articleContent);
      onProgress(50);
      console.log("İçerik analizi tamamlandı:", analysis);

      const maxLinks = linkingMethod === "manual" 
        ? parseInt(manualLinkCount) 
        : Math.max(1, Math.floor(articleContent.length / 500));
      console.log("Eklenecek maksimum link sayısı:", maxLinks);
      
      const relevantContent = contentMatcher.findRelevantContent(
        analysis,
        urlData,
        maxLinks
      );
      onProgress(70);
      console.log("İlgili içerikler bulundu:", relevantContent.length);

      const processedUrls = await contentAnalyzer.extractUrlsWithKeywords(relevantContent);
      onProgress(80);
      console.log("Link önerileri oluşturuldu:", processedUrls);
      
      const links: ProcessedLink[] = processedUrls.map((url, index) => {
        const position = Math.min(1 + index * 2, paragraphs.length - 1);
        return {
          url: url.url,
          anchorText: url.keyword,
          position: `paragraph_${position}`,
          similarityScore: url.similarity,
          paragraph: paragraphs[position]
        };
      });
      onProgress(90);
      console.log("Link pozisyonları belirlendi:", links);

      const linkedContent = insertLinks(articleContent, links);
      onProgress(95);
      console.log("Linkler içeriğe eklendi");

      onProcessComplete(links, linkedContent);
      onProgress(100);

      toast({
        description: `${links.length} adet link başarıyla eklendi ve rapor oluşturuldu.`,
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