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
  pre_text?: string;
  anchor_text: string;
  post_text?: string;
  position: string;
  similarityScore: number;
  paragraph: string;
}

export const useContentProcessor = () => {
  const { toast } = useToast();
  const contentMatcher = new ContentMatcher();

  const calculateWordCount = (html: string): number => {
    const div = document.createElement('div');
    div.innerHTML = html;
    const paragraphs = div.querySelectorAll('p');
    let totalWords = 0;
    
    paragraphs.forEach(p => {
      totalWords += p.textContent?.split(/\s+/).length || 0;
    });
    
    return totalWords;
  };

  const calculateMaxLinks = (wordCount: number): number => {
    const suggestedLinks = Math.floor(wordCount / 500);
    return Math.min(Math.max(suggestedLinks, 1), 10);
  };

  const calculateLinkPositions = (totalParagraphs: number, maxLinks: number): number[] => {
    if (totalParagraphs < 3) return [];
    
    // Son %15'i kullanma
    const effectiveParagraphs = Math.floor(totalParagraphs * 0.85);
    
    if (effectiveParagraphs < maxLinks) return [];
    
    // İdeal aralığı hesapla
    const spacing = Math.floor(effectiveParagraphs / maxLinks);
    
    // İlk linki 3. paragraftan önce ekleme
    const positions = [Math.max(3, Math.floor(spacing / 2))];
    
    // Diğer linklerin pozisyonlarını hesapla
    for (let i = 1; i < maxLinks; i++) {
      let nextPos = positions[positions.length - 1] + spacing;
      if (i === maxLinks - 1) {
        nextPos = Math.min(nextPos, effectiveParagraphs - 2);
      }
      positions.push(nextPos);
    }
    
    return positions;
  };

  const insertLinks = (content: string, links: ProcessedLink[]): string => {
    if (!links.length) return content;

    const div = document.createElement('div');
    div.innerHTML = content;
    
    // Stil tanımlamaları
    const styles = document.createElement('style');
    styles.textContent = `
      .related-content {
        margin: 20px 0;
        padding: 15px;
        background-color: var(--bg-color, #f8f9fa);
        border-left: 3px solid var(--primary-color, #7952b3);
        border-radius: 3px;
        font-style: italic;
        color: var(--text-color, #555);
        position: relative;
        transition: all 0.3s ease;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      }

      .related-content:hover {
        background-color: var(--bg-hover-color, #f3f4f6);
        transform: translateX(5px);
        box-shadow: 2px 4px 8px rgba(0,0,0,0.1);
      }

      .related-content::before {
        content: '';
        position: absolute;
        top: 0;
        left: -3px;
        height: 100%;
        width: 3px;
        background: linear-gradient(to bottom, #7952b3, #9b6fdf);
        border-radius: 3px 0 0 3px;
        opacity: 0.8;
      }

      .related-content i {
        margin-right: 8px;
        color: var(--primary-color, #7952b3);
        font-size: 1em;
        transition: transform 0.3s ease;
      }

      .related-content:hover i {
        transform: translateX(3px);
      }

      .related-content a {
        color: var(--primary-color, #7952b3);
        text-decoration: none;
        font-weight: 500;
        transition: all 0.2s ease;
        padding: 2px 5px;
        border-radius: 3px;
        background-color: transparent;
      }

      .related-content a:hover {
        background-color: rgba(121, 82, 179, 0.1);
        color: var(--primary-dark-color, #5a3d8c);
      }

      @media (prefers-color-scheme: dark) {
        .related-content {
          --bg-color: rgba(121, 82, 179, 0.1);
          --bg-hover-color: rgba(121, 82, 179, 0.15);
          --text-color: #e0e0e0;
          --primary-color: #9b6fdf;
          --primary-dark-color: #b794f4;
        }
      }
    `;
    
    div.appendChild(styles);

    links.forEach(link => {
      const position = parseInt(link.position.split('_')[1]);
      const paragraphs = Array.from(div.querySelectorAll('p'));

      if (position < paragraphs.length) {
        const paragraph = paragraphs[position];

        const linkContainer = document.createElement('div');
        linkContainer.className = 'related-content';

        // Icon ekle
        const icon = document.createElement('i');
        icon.className = 'fa-solid fa-arrow-right';
        linkContainer.appendChild(icon);

        // Pre-text ekle
        if (link.pre_text) {
          const preText = document.createElement('span');
          preText.textContent = link.pre_text + ' ';
          linkContainer.appendChild(preText);
        }

        // Link ekle
        const a = document.createElement('a');
        a.href = link.url;
        a.textContent = link.anchor_text;
        linkContainer.appendChild(a);

        // Post-text ekle
        if (link.post_text) {
          const postText = document.createElement('span');
          postText.textContent = ' ' + link.post_text;
          linkContainer.appendChild(postText);
        }

        paragraph.insertAdjacentElement('afterend', linkContainer);
      }
    });

    return div.innerHTML;
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

      // URL veritabanını oku
      const databaseContent = await urlDatabase.text();
      let urlData = JSON.parse(databaseContent);

      onProgress(20);
      console.log("URL database okundu:", urlData.length, "URL bulundu");

      // İçeriği analiz et
      const contentAnalyzer = new ContentAnalyzer(apiKey);
      const paragraphs = contentAnalyzer.analyzeParagraphs(articleContent);
      
      if (paragraphs.length < 3) {
        toast({
          title: "Hata",
          description: "Makale çok kısa, en az 3 paragraf gerekli",
          variant: "destructive",
        });
        return;
      }

      onProgress(30);
      console.log("Makale", paragraphs.length, "paragrafa ayrıldı");

      // Kelime sayısını hesapla
      const wordCount = calculateWordCount(articleContent);
      const maxLinks = linkingMethod === "manual"
        ? parseInt(manualLinkCount)
        : calculateMaxLinks(wordCount);

      console.log(`Kelime sayısı: ${wordCount}, Önerilen link sayısı: ${maxLinks}`);

      const analysis = await contentAnalyzer.analyzeContent(articleContent);
      onProgress(50);
      console.log("İçerik analizi tamamlandı:", analysis);

      // Link pozisyonlarını hesapla
      const positions = calculateLinkPositions(paragraphs.length, maxLinks);
      if (positions.length === 0) {
        throw new Error("Uygun link pozisyonu bulunamadı");
      }

      console.log("Link pozisyonları:", positions);

      // İlgili içerikleri bul
      const relevantContent = contentMatcher.findRelevantContent(
        analysis,
        urlData,
        maxLinks
      );

      onProgress(70);
      console.log("İlgili içerikler bulundu:", relevantContent.length, relevantContent);

      if (relevantContent.length === 0) {
        throw new Error("İçerikle alakalı link bulunamadı");
      }

      // Link işleme
      const processedLinks: ProcessedLink[] = [];

      for (const [index, urlData] of relevantContent.entries()) {
        console.log("Processing URL:", urlData);
        
        const position = positions[index];
        const paragraph = paragraphs[position];
        
        // Link metni oluştur
        console.log("Generating link text for position:", position);
        const linkText = await contentAnalyzer.generateLinkText(
          paragraph.text,
          urlData
        );
        console.log("Generated link text:", linkText);
        
        if (linkText && contentAnalyzer.validateLinkText(linkText, urlData)) {
          processedLinks.push({
            url: urlData.url,
            pre_text: linkText.pre_text,
            anchor_text: linkText.anchor_text,
            post_text: linkText.post_text,
            position: `paragraph_${position}`,
            similarityScore: urlData.similarity,
            paragraph: paragraph.text
          });
          console.log("Link added to processedLinks");
        } else {
          console.log("Link text validation failed");
        }
      }

      onProgress(90);
      console.log("İşlenen linkler:", processedLinks);

      // Linkleri içeriğe ekle
      const linkedContent = insertLinks(articleContent, processedLinks);

      onProcessComplete(processedLinks, linkedContent);
      onProgress(100);

      toast({
        description: `${processedLinks.length} adet link başarıyla eklendi.`,
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
