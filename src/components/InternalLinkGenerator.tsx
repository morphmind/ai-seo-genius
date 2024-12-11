import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { ContentAnalyzer } from "@/utils/internal-linking/contentAnalyzer";
import { ContentMatcher } from "@/utils/internal-linking/contentMatcher";

const InternalLinkGenerator = () => {
  const [urlDatabase, setUrlDatabase] = useState<File | null>(null);
  const [articleContent, setArticleContent] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [linkingMethod, setLinkingMethod] = useState<"manual" | "auto">("manual");
  const [manualLinkCount, setManualLinkCount] = useState("3");
  const { toast } = useToast();

  const handleUrlDatabaseUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.name.endsWith('.json')) {
        setUrlDatabase(file);
      } else {
        toast({
          title: "Hata",
          description: "Lütfen .json formatında bir URL database dosyası yükleyin",
          variant: "destructive",
        });
      }
    }
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
            <div className="space-y-2">
              <Label htmlFor="urlDatabase">URL Database (.json)</Label>
              <Input
                id="urlDatabase"
                type="file"
                accept=".json"
                onChange={handleUrlDatabaseUpload}
                className="cursor-pointer"
              />
              {urlDatabase && (
                <p className="text-sm text-muted-foreground">
                  Yüklenen dosya: {urlDatabase.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Link Sayısı Belirleme Yöntemi</Label>
              <RadioGroup
                value={linkingMethod}
                onValueChange={(value: "manual" | "auto") => setLinkingMethod(value)}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="manual" id="manual" />
                  <Label htmlFor="manual">Manuel Sayı</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="auto" id="auto" />
                  <Label htmlFor="auto">Otomatik (500 kelimede 1)</Label>
                </div>
              </RadioGroup>
            </div>

            {linkingMethod === "manual" && (
              <div className="space-y-2">
                <Label htmlFor="linkCount">Link Sayısı</Label>
                <Input
                  id="linkCount"
                  type="number"
                  min="1"
                  value={manualLinkCount}
                  onChange={(e) => setManualLinkCount(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="article">Makale İçeriği</Label>
              <Textarea
                id="article"
                placeholder="Makale içeriğini buraya girin"
                value={articleContent}
                onChange={(e) => setArticleContent(e.target.value)}
                className="min-h-[200px]"
              />
            </div>

            <Button
              className="w-full"
              onClick={processContent}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  İşleniyor...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  İç Linkleme İşlemini Başlat
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InternalLinkGenerator;