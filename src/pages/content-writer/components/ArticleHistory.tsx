import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Download, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ArticleHistory as ArticleHistoryType } from "../types";
import { format } from "date-fns";
import DOMPurify from 'dompurify';

interface ArticleHistoryProps {
  articles: ArticleHistoryType[];
  onDelete: (id: string) => void;
}

export function ArticleHistory({ articles, onDelete }: ArticleHistoryProps) {
  const [openArticleId, setOpenArticleId] = useState<string | null>(null);
  const { toast } = useToast();

  // Duplicate kontrolü ve sıralama
  const uniqueArticles = useMemo(() => {
    const uniqueMap = new Map<string, ArticleHistoryType>();
    articles.forEach(article => {
      if (!uniqueMap.has(article.id)) {
        uniqueMap.set(article.id, article);
      }
    });
    return Array.from(uniqueMap.values())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [articles]);

  const handleCopy = async (html: string) => {
    try {
      const tempTextArea = document.createElement('textarea');
      tempTextArea.value = html;
      document.body.appendChild(tempTextArea);
      tempTextArea.select();
      
      try {
        await navigator.clipboard.writeText(tempTextArea.value);
        toast({
          title: "Success",
          description: "Article copied to clipboard"
        });
      } catch (err) {
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
  };

  const handleDownload = (html: string, title: string) => {
    const cleanHtml = DOMPurify.sanitize(html);
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
        ${cleanHtml}
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
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      onDelete(id);
      if (openArticleId === id) {
        setOpenArticleId(null);
      }
    }
  };

  if (uniqueArticles.length === 0) {
    return null;
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Article History ({uniqueArticles.length})</span>
          {uniqueArticles.length > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all articles?')) {
                  uniqueArticles.forEach(article => onDelete(article.id));
                }
              }}
            >
              Clear All
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {uniqueArticles.map((article) => (
          <Collapsible
            key={article.id}
            open={openArticleId === article.id}
            onOpenChange={(isOpen) => setOpenArticleId(isOpen ? article.id : null)}
          >
            <div className="flex items-center justify-between p-4 border rounded-lg mb-2 bg-card">
              <div>
                <h3 className="font-medium">{article.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(article.date), "PPP")} - Keyword: {article.keyword}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(article.html)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(article.html, article.title)}
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(article.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm">
                    {openArticleId === article.id ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
              </div>
            </div>
            <CollapsibleContent>
              <div 
                className="prose prose-sm dark:prose-invert max-w-none p-4 border-x border-b rounded-b-lg space-y-4 bg-card"
                dangerouslySetInnerHTML={{ 
                  __html: DOMPurify.sanitize(article.html, {
                    ADD_TAGS: ['iframe'],
                    ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'style', 'loading']
                  })
                }}
              />
            </CollapsibleContent>
          </Collapsible>
        ))}
      </CardContent>
    </Card>
  );
}
