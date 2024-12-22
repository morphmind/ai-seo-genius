import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ProcessedLink } from "./LinkProcessor";
import { Copy, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LinkReportProps {
  links: ProcessedLink[];
  content: string;
}

const LinkReport: React.FC<LinkReportProps> = ({ links, content }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("summary");

  const handleCopyHTML = () => {
    // Geçici bir textarea elementi oluştur
    const textarea = document.createElement('textarea');
    textarea.value = content;
    document.body.appendChild(textarea);
    
    try {
      // Metni seç ve kopyala
      textarea.select();
      document.execCommand('copy');
      toast({ description: "HTML içeriği kopyalandı!" });
    } catch (err) {
      console.error('Kopyalama hatası:', err);
      toast({ 
        title: "Hata",
        description: "İçerik kopyalanamadı. Lütfen manuel olarak kopyalayın.",
        variant: "destructive"
      });
    } finally {
      // Textarea'yı temizle
      document.body.removeChild(textarea);
    }
  };

  const handleDownloadHTML = () => {
    const blob = new Blob([content], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "article_with_links.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ description: "HTML dosyası indirildi!" });
  };

  const calculateAverageSimilarity = () => {
    if (links.length === 0) return 0;
    const sum = links.reduce((acc, link) => acc + link.similarityScore, 0);
    return (sum / links.length).toFixed(2);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Link Raporu</CardTitle>
          <div className="space-x-2">
            <Button variant="outline" size="sm" onClick={handleCopyHTML}>
              <Copy className="h-4 w-4 mr-1" />
              HTML Kopyala
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadHTML}>
              <Download className="h-4 w-4 mr-1" />
              HTML İndir
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="summary">Özet</TabsTrigger>
            <TabsTrigger value="details">Detaylar</TabsTrigger>
            <TabsTrigger value="preview">Önizleme</TabsTrigger>
          </TabsList>

          <TabsContent value="summary">
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{links.length}</div>
                    <div className="text-sm text-muted-foreground">
                      Toplam Link
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">
                      {calculateAverageSimilarity()}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Ortalama Benzerlik
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="details">
            <div className="space-y-4">
              {links.map((link, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">Link URL:</span>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {link.url}
                        </a>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Pozisyon:</span>
                        <span>Paragraf {link.position.split("_")[1]}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Benzerlik Skoru:</span>
                        <span>{link.similarityScore.toFixed(2)}%</span>
                      </div>
                      <div className="mt-2 p-3 bg-muted rounded-md">
                        {link.pre_text && (
                          <span className="text-muted-foreground">
                            {link.pre_text}{" "}
                          </span>
                        )}
                        <span className="font-medium text-primary">
                          {link.anchor_text}
                        </span>
                        {link.post_text && (
                          <span className="text-muted-foreground">
                            {" "}
                            {link.post_text}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="preview">
            <Card>
              <CardContent className="pt-6">
                <div
                  className="prose max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default LinkReport;
