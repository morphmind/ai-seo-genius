import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText } from "lucide-react";

const InternalLinkGenerator = () => {
  const [sitemapFile, setSitemapFile] = useState<File | null>(null);
  const [articleFiles, setArticleFiles] = useState<FileList | null>(null);
  const { toast } = useToast();

  const handleSitemapUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.txt')) {
      setSitemapFile(file);
    } else {
      toast({
        title: "Hata",
        description: "Lütfen geçerli bir .txt sitemap dosyası yükleyin.",
        variant: "destructive",
      });
    }
  };

  const handleArticlesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const allTxtFiles = Array.from(files).every(file => file.name.endsWith('.txt'));
      if (allTxtFiles) {
        setArticleFiles(files);
      } else {
        toast({
          title: "Hata",
          description: "Lütfen sadece .txt dosyaları yükleyin.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSubmit = async () => {
    if (!sitemapFile || !articleFiles) {
      toast({
        title: "Hata",
        description: "Lütfen sitemap ve makale dosyalarını yükleyin.",
        variant: "destructive",
      });
      return;
    }

    // Burada API çağrısı yapılacak
    toast({
      title: "Başarılı",
      description: "İşlem başlatıldı. Sonuçlar hazır olduğunda bildirilecek.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="sitemap">Sitemap Dosyası (.txt)</Label>
              <div className="mt-2">
                <Input
                  id="sitemap"
                  type="file"
                  accept=".txt"
                  onChange={handleSitemapUpload}
                  className="cursor-pointer"
                />
              </div>
              {sitemapFile && (
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  {sitemapFile.name}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="articles">Makale Dosyaları (.txt)</Label>
              <div className="mt-2">
                <Input
                  id="articles"
                  type="file"
                  accept=".txt"
                  multiple
                  onChange={handleArticlesUpload}
                  className="cursor-pointer"
                />
              </div>
              {articleFiles && (
                <div className="mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {articleFiles.length} dosya seçildi
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={handleSubmit}
              className="w-full"
              disabled={!sitemapFile || !articleFiles}
            >
              <Upload className="mr-2 h-4 w-4" />
              İç Linkleme Başlat
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InternalLinkGenerator;