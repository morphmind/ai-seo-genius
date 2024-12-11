import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Upload } from "lucide-react";

const InternalLinkGenerator = () => {
  const [sitemapFile, setSitemapFile] = useState<File | null>(null);
  const [articleFiles, setArticleFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const { toast } = useToast();

  const handleSitemapUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
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
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const validFiles = files.every(file => file.name.endsWith('.txt'));
      
      if (validFiles) {
        setArticleFiles(e.target.files);
      } else {
        toast({
          title: "Hata",
          description: "Lütfen sadece .txt formatında makaleler yükleyin",
          variant: "destructive",
        });
      }
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

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('sitemap', sitemapFile);
      Array.from(articleFiles).forEach(file => {
        formData.append('articles', file);
      });

      // API endpoint'i hazır olduğunda burası güncellenecek
      const response = await fetch('/api/internal-linking', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('İşlem başarısız oldu');
      }

      const data = await response.json();
      setResults(data.results);
      
      toast({
        title: "Başarılı",
        description: "İç linkleme işlemi tamamlandı",
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: "İşlem sırasında bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="sitemap">Sitemap Dosyası (.txt)</Label>
            <Input
              id="sitemap"
              type="file"
              accept=".txt"
              onChange={handleSitemapUpload}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="articles">Makale Dosyaları (.txt)</Label>
            <Input
              id="articles"
              type="file"
              accept=".txt"
              multiple
              onChange={handleArticlesUpload}
              className="mt-2"
            />
          </div>

          <Button
            className="w-full"
            onClick={processFiles}
            disabled={loading || !sitemapFile || !articleFiles}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                İşleniyor...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                İç Linkleme Başlat
              </>
            )}
          </Button>
        </div>
      </Card>

      {results.length > 0 && (
        <Card className="p-6">
          <Label>Sonuçlar</Label>
          <ScrollArea className="h-[300px] mt-2">
            <div className="space-y-2">
              {results.map((result, index) => (
                <div key={index} className="p-3 bg-secondary rounded-md">
                  {result}
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      )}
    </div>
  );
};

export default InternalLinkGenerator;