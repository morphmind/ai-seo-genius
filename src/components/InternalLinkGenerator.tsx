import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload } from "lucide-react";

declare global {
  interface Window {
    pyodide: any;
  }
}

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
      // Pyodide'yi yükle
      if (!window.pyodide) {
        window.pyodide = await loadPyodide();
      }

      // Dosyaları oku
      const sitemapContent = await sitemapFile.text();
      const articleContents = await Promise.all(
        Array.from(articleFiles).map(file => file.text())
      );

      // Python kodunu çalıştır
      await window.pyodide.loadPackagesFromImports(`
        import os
        from pathlib import Path
      `);

      // Geçici dosya sistemi oluştur
      window.pyodide.runPython(`
        os.makedirs("makaleler", exist_ok=True)
        os.makedirs("report", exist_ok=True)
        
        with open("sitemap.txt", "w") as f:
          f.write("""${sitemapContent}""")
          
        for i, content in enumerate(${JSON.stringify(articleContents)}):
          with open(f"makaleler/article_{i}.txt", "w") as f:
            f.write(content)
      `);

      // Ana Python kodunu çalıştır
      const result = window.pyodide.runPython(`
        from src.internal_linking_system import InternalLinkingSystem
        from src.utils.api_key_manager import ApiKeyManager
        
        api_key_manager = ApiKeyManager()
        system = InternalLinkingSystem(
          sitemap_path="sitemap.txt",
          articles_dir="makaleler",
          api_key_manager=api_key_manager
        )
        
        system.initialize_api_key()
        system.run()
        
        "İşlem tamamlandı!"
      `);

      toast({
        title: "Başarılı",
        description: result,
      });

    } catch (error) {
      console.error('Python kodu çalıştırma hatası:', error);
      toast({
        title: "Hata",
        description: "İşlem sırasında bir hata oluştu: " + String(error),
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