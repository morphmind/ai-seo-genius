import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Download, Camera, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

interface PromptOutputProps {
  title: string;
  content: string;
  onCopy: (text: string) => void;
  inputTitle: string;
}

interface GeneratedImage {
  url: string;
}

const PromptOutput = ({ title, content, onCopy, inputTitle }: PromptOutputProps) => {
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const { toast } = useToast();

  const generateImages = async () => {
    const apiKey = localStorage.getItem("recraft_api_key");
    if (!apiKey) {
      toast({
        title: "Error",
        description: "Please set your Recraft.ai API key in settings",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log("Making request to Recraft.ai API");
      
      const response = await fetch("https://external.api.recraft.ai/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey.trim()}`
        },
        body: JSON.stringify({
          prompt: content,
          n: 2,
          size: "2048x1024",
          style: "digital_illustration"
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        throw new Error(errorData.message || "Failed to generate images");
      }

      const data = await response.json();
      setImages(data.data || []);
    } catch (error) {
      console.error("Generation error:", error);
      toast({
        title: "Error",
        description: "Failed to generate images. Please ensure your API key is valid and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = async (url: string, index: number) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${inputTitle}_${index + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download image",
        variant: "destructive",
      });
    }
  };

  const handleCopy = (text: string) => {
    try {
      // Geçici bir div elementi oluştur
      const el = document.createElement('div');
      el.setAttribute('contenteditable', 'true');
      el.innerHTML = text;
      el.style.position = 'fixed';
      el.style.left = '-9999px';
      document.body.appendChild(el);

      // Metni seç
      const range = document.createRange();
      range.selectNodeContents(el);
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }

      // Kopyalama dene
      try {
        document.execCommand('copy');
        onCopy(text);
        toast({
          description: "İçerik kopyalandı",
        });
      } catch (err) {
        // Alternatif yöntem
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        onCopy(text);
        toast({
          description: "İçerik kopyalandı",
        });
      }

      // Temizlik
      document.body.removeChild(el);
    } catch (error) {
      console.error('Kopyalama hatası:', error);
      toast({
        title: "Hata",
        description: "Manuel olarak seçip kopyalayınız",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold text-gray-700">{title}</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-gray-100"
              onClick={() => handleCopy(content)}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-gray-100"
              onClick={generateImages}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <ScrollArea className="h-[200px] w-full rounded-md border border-gray-200">
            <div className="p-4">
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{content}</p>
            </div>
          </ScrollArea>
          
          {images.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image.url}
                    alt={`Generated image ${index + 1}`}
                    className="w-full rounded-lg"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => downloadImage(image.url, index)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PromptOutput;
