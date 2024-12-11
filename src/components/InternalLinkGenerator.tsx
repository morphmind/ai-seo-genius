import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload } from "lucide-react";

const InternalLinkGenerator = () => {
  const [sitemapFile, setSitemapFile] = useState<File | null>(null);
  const [articleFiles, setArticleFiles] = useState<FileList | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleSitemapUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.name.endsWith('.txt')) {
        setSitemapFile(file);
      } else {
        toast({
          title: "Hata",
          description: "Lütfen .txt formatında bir sitemap dosyası yükleyin",
          variant: "destructive",
        });
      }
    }
  };

  const handleArticlesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const invalidFiles = Array.from(files).filter(file => !file.name.endsWith('.txt'));
      if (invalidFiles.length > 0) {
        toast({
          title: "Hata",
          description: "Tüm makaleler .txt formatında olmalıdır",
          variant: "destructive",
        });
        return;
      }
      setArticleFiles(files);
    }
  };

  const processFiles = async () => {
    if (!sitemapFile || !articleFiles) {
      toast({
        title: "Hata",
        description: "Lütfen sitemap ve makale dosyalarını yükleyin",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('sitemap', sitemapFile);
      Array.from(articleFiles).forEach(file => {
        formData.append('articles', file);
      });

      // API endpoint'i hazır olduğunda burası güncellenecek
      const response = await fetch('/api/internal-linking', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('İşlem başarısız oldu');
      }

      const result = await response.json();
      
      toast({
        title: "Başarılı",
        description: "İç linkleme işlemi tamamlandı",
      });

      // Sonuçları göster veya indirme bağlantısı sağla
      if (result.downloadUrl) {
        window.open(result.downloadUrl, '_blank');
      }

    } catch (error) {
      toast({
        title: "Hata",
        description: "İşlem sırasında bir hata oluştu",
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
              <Label htmlFor="sitemap">Sitemap Dosyası (.txt)</Label>
              <Input
                id="sitemap"
                type="file"
                accept=".txt"
                onChange={handleSitemapUpload}
                className="cursor-pointer"
              />
              {sitemapFile && (
                <p className="text-sm text-muted-foreground">
                  Yüklenen dosya: {sitemapFile.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="articles">Makale Dosyaları (.txt)</Label>
              <Input
                id="articles"
                type="file"
                accept=".txt"
                multiple
                onChange={handleArticlesUpload}
                className="cursor-pointer"
              />
              {articleFiles && (
                <p className="text-sm text-muted-foreground">
                  Yüklenen dosya sayısı: {articleFiles.length}
                </p>
              )}
            </div>

            <Button
              className="w-full"
              onClick={processFiles}
              disabled={isProcessing || !sitemapFile || !articleFiles}
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