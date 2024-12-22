import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Copy, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ArticleHistory } from "../types";
import DOMPurify from 'dompurify';

interface ArticleOutputProps {
  articleId: string | null;
  apiKey: string;
  onClose: () => void;
  onSaveToHistory: (article: ArticleHistory) => void;
}

interface ArticleResponse {
  status: "queued" | "processing" | "finished" | "failed";
  statusDetail: string;
  progress: number;
  config?: {
    targetKeyword?: string;
  };
  output?: {
    html: string;
    polishedHtml: string | null;
  };
  error?: string;
}

export function ArticleOutput({ articleId, apiKey, onClose, onSaveToHistory }: ArticleOutputProps) {
  const [article, setArticle] = useState<ArticleResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState<string | null>(null);
  const { toast } = useToast();

  const processHTML = useCallback((html: string): string => {
    // Temel HTML temizleme
    let processedHtml = DOMPurify.sanitize(html, {
      ADD_TAGS: ['iframe'],
      ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'style', 'loading']
    });

    // CORS ve güvenlik ayarları ile resimleri ve iframeleri düzeltme
    processedHtml = processedHtml.replace(
      /<img(.*?)src="(.*?)"(.*?)>/gi,
      '<img$1src="$2" crossorigin="anonymous" loading="lazy" onerror="this.src=\'/placeholder.jpg\';" style="max-width: 100%; height: auto; display: block; margin: 1rem auto;"$3>'
    );

    // YouTube iframelerini düzenleme
    processedHtml = processedHtml.replace(
      /<iframe(.*?)src="(.*?)youtube\.com\/embed\/(.*?)"(.*?)>/gi,
      `<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 1rem 0;">
        <iframe$1src="https://www.youtube.com/embed/$3" 
          style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          loading="lazy"$4>
        </iframe>
      </div>`
    );

    // Stil ve düzen iyileştirmeleri
    processedHtml = `
      <div style="font-family: system-ui, -apple-system, sans-serif;">
        <style>
          img {
            max-width: 100%;
            height: auto;
            display: block;
            margin: 1rem auto;
            border-radius: 8px;
          }
          .video-wrapper {
            position: relative;
            padding-bottom: 56.25%;
            height: 0;
            margin: 1rem 0;
          }
          .video-wrapper iframe {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border-radius: 8px;
          }
          h1, h2, h3, h4, h5, h6 {
            margin-top: 2rem;
            margin-bottom: 1rem;
            line-height: 1.3;
          }
          p {
            margin: 1rem 0;
            line-height: 1.6;
          }
          ul, ol {
            margin: 1rem 0;
            padding-left: 2rem;
          }
          li {
            margin: 0.5rem 0;
          }
        </style>
        ${processedHtml}
      </div>
    `;

    return processedHtml;
  }, []);

  const extractTitle = useCallback((html: string): string => {
    const match = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
    return match ? match[1].replace(/<[^>]*>/g, '') : "Untitled Article";
  }, []);

  useEffect(() => {
    if (!articleId || isSaved === articleId) return;

    const checkStatus = async () => {
      try {
        const response = await fetch(`https://koala.sh/api/articles/${articleId}`, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setArticle(data);

        if (data.status === "finished" && isSaved !== articleId && data.output?.html) {
          const processedHtml = processHTML(data.output.html);
          const newArticle: ArticleHistory = {
            id: articleId,
            title: extractTitle(processedHtml),
            date: new Date().toISOString(),
            html: processedHtml,
            keyword: data.config?.targetKeyword || ""
          };

          onSaveToHistory(newArticle);
          setIsSaved(articleId);
          setLoading(false);
        } else if (data.status === "failed") {
          setLoading(false);
        } else if (data.status === "processing" || data.status === "queued") {
          setTimeout(checkStatus, 60000);
        }
      } catch (error) {
        console.error("Error checking article status:", error);
        toast({
          title: "Error",
          description: "Failed to check article status. Please try again later.",
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    checkStatus();
  }, [articleId, apiKey, toast, onSaveToHistory, extractTitle, processHTML, isSaved]);

  const handleCopy = async () => {
    if (article?.output?.html) {
      try {
        // Textbox oluşturup kullanıcının manuel kopyalaması için
        const tempTextArea = document.createElement('textarea');
        tempTextArea.value = processHTML(article.output.html);
        document.body.appendChild(tempTextArea);
        tempTextArea.select();
        
        try {
          await navigator.clipboard.writeText(tempTextArea.value);
          toast({
            title: "Success",
            description: "Article copied to clipboard"
          });
        } catch (err) {
          // Fallback: Kullanıcıdan manuel kopyalama isteme
          document.execCommand('copy');
          toast({
            title: "Success",
            description: "Article copied to clipboard (manual copy)"
          });
        }
        
        document.body.removeChild(tempTextArea);
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to copy. Please try selecting and copying manually.",
          variant: "destructive"
        });
      }
    }
  };

  const handleDownload = () => {
    if (article?.output?.html) {
      const title = extractTitle(article.output.html);
      const processedHtml = processHTML(article.output.html);
      const formattedHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title}</title>
          <style>
            body {
              font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', 
                         Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
              line-height: 1.6;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            img {
              max-width: 100%;
              height: auto;
              margin: 20px auto;
              display: block;
              border-radius: 8px;
            }
            .video-wrapper {
              position: relative;
              padding-bottom: 56.25%;
              height: 0;
              margin: 20px auto;
            }
            .video-wrapper iframe {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              border-radius: 8px;
            }
            h1 {
              font-size: 2.5em;
              margin-bottom: 0.5em;
              line-height: 1.2;
            }
            h2, h3 {
              margin-top: 1.5em;
              margin-bottom: 0.5em;
            }
            p {
              margin: 1em 0;
            }
          </style>
        </head>
        <body>
          ${processedHtml}
        </body>
        </html>
      `;

      const blob = new Blob([formattedHtml], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  if (!article) return null;

  return (
    <Card className="mt-8 w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Article Status</CardTitle>
        {article.status === "finished" && (
          <div className="flex gap-2">
            <Button onClick={handleCopy} size="sm">
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
            <Button onClick={handleDownload} size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>
              {article.statusDetail} ({Math.round(article.progress * 100)}%)
            </span>
          </div>
        ) : article.status === "finished" ? (
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <div 
              dangerouslySetInnerHTML={{ 
                __html: processHTML(article.output?.html || "") 
              }}
              className="article-content"
            />
          </div>
        ) : (
          <div className="text-red-500">
            Error: {article.error || "Failed to generate article"}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
