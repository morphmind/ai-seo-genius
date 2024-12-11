import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

declare global {
  interface Window {
    pyodide: any;
    loadPyodide: () => Promise<any>;
  }
}

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
      // Pyodide'yi yükle
      if (!window.pyodide) {
        window.pyodide = await window.loadPyodide();
      }

      // URL database'ini ve makale içeriğini oku
      const databaseContent = await urlDatabase.text();

      // Python kodunu çalıştır
      await window.pyodide.loadPackagesFromImports(`
        import os
        from pathlib import Path
        import json
      `);

      // Geçici dosya sistemi oluştur
      window.pyodide.runPython(`
        os.makedirs("report", exist_ok=True)
        
        with open("url_database.json", "w") as f:
          f.write("""${databaseContent}""")
          
        with open("article.txt", "w") as f:
          f.write("""${articleContent}""")
      `);

      // Ana Python kodunu çalıştır
      const result = window.pyodide.runPython(`
        from src.internal_linking_system import InternalLinkingSystem
        from src.utils.api_key_manager import ApiKeyManager
        
        api_key_manager = ApiKeyManager()
        system = InternalLinkingSystem(
          database_path="url_database.json",
          article_path="article.txt",
          api_key_manager=api_key_manager,
          link_method="${linkingMethod}",
          manual_link_count=${linkingMethod === "manual" ? manualLinkCount : "None"}
        )
        
        system.initialize_api_key()
        processed_content = system.process_single_article()
        
        with open("report/processed_article.txt", "w") as f:
          f.write(processed_content)
        
        "İşlem tamamlandı!"
      `);

      // İşlenmiş makaleyi indir
      const processedContent = window.pyodide.FS.readFile("report/processed_article.txt", { encoding: "utf8" });
      const blob = new Blob([processedContent], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "processed_article.txt";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

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