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
import { format } from "date-fns";
import jsPDF from 'jspdf';

interface IdeaResult {
  title: string;
  description: string;
}

interface IdeaHistoryItem {
  id: string;
  topic: string;
  date: string;
  gpt4Ideas: IdeaResult[];
  gptMiniIdeas: IdeaResult[];
}

interface IdeaHistoryProps {
  ideas: IdeaHistoryItem[];
  onDelete: (id: string) => void;
}

export function IdeaHistory({ ideas, onDelete }: IdeaHistoryProps) {
  const [openIdeaId, setOpenIdeaId] = useState<string | null>(null);
  const { toast } = useToast();

  // Duplicate kontrolü ve sıralama
  const uniqueIdeas = useMemo(() => {
    const uniqueMap = new Map<string, IdeaHistoryItem>();
    ideas.forEach(idea => {
      if (!uniqueMap.has(idea.id)) {
        uniqueMap.set(idea.id, idea);
      }
    });
    return Array.from(uniqueMap.values())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [ideas]);

  const handleCopy = async (title: string, description: string) => {
    try {
      const text = `${title}\n\n${description}`;
      await navigator.clipboard.writeText(text);
      toast({
        title: "Başarılı",
        description: "İçerik panoya kopyalandı"
      });
    } catch (err) {
      toast({
        title: "Hata",
        description: "Kopyalama işlemi başarısız oldu. Lütfen manuel olarak kopyalayın.",
        variant: "destructive"
      });
    }
  };

  const handleDownloadPDF = (idea: IdeaHistoryItem) => {
    const pdf = new jsPDF();
    let yPos = 20;
    const pageHeight = pdf.internal.pageSize.height;
    const margin = 20;
    const lineHeight = 7;

    // PDF başlığı
    pdf.setFontSize(16);
    pdf.text(`İçerik Fikirleri: ${idea.topic}`, margin, yPos);
    yPos += lineHeight * 2;

    // GPT-4 Önerileri
    pdf.setFontSize(14);
    pdf.text("GPT-4 Önerileri:", margin, yPos);
    yPos += lineHeight * 1.5;

    pdf.setFontSize(11);
    idea.gpt4Ideas.forEach((item, index) => {
      if (yPos > pageHeight - margin) {
        pdf.addPage();
        yPos = margin;
      }

      pdf.setFont(undefined, 'bold');
      pdf.text(`${index + 1}. ${item.title}`, margin, yPos);
      yPos += lineHeight;

      pdf.setFont(undefined, 'normal');
      const descLines = pdf.splitTextToSize(item.description, pdf.internal.pageSize.width - margin * 2);
      pdf.text(descLines, margin, yPos);
      yPos += lineHeight * (descLines.length + 1);
    });

    // GPT-Mini Önerileri
    yPos += lineHeight;
    if (yPos > pageHeight - margin) {
      pdf.addPage();
      yPos = margin;
    }

    pdf.setFontSize(14);
    pdf.text("GPT-Mini Önerileri:", margin, yPos);
    yPos += lineHeight * 1.5;

    pdf.setFontSize(11);
    idea.gptMiniIdeas.forEach((item, index) => {
      if (yPos > pageHeight - margin) {
        pdf.addPage();
        yPos = margin;
      }

      pdf.setFont(undefined, 'bold');
      pdf.text(`${index + 1}. ${item.title}`, margin, yPos);
      yPos += lineHeight;

      pdf.setFont(undefined, 'normal');
      const descLines = pdf.splitTextToSize(item.description, pdf.internal.pageSize.width - margin * 2);
      pdf.text(descLines, margin, yPos);
      yPos += lineHeight * (descLines.length + 1);
    });

    pdf.save(`içerik-fikirleri-${idea.topic.toLowerCase().replace(/\s+/g, '-')}.pdf`);
    toast({
      description: "PDF başarıyla indirildi",
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bu fikir setini silmek istediğinizden emin misiniz?')) {
      onDelete(id);
      if (openIdeaId === id) {
        setOpenIdeaId(null);
      }
    }
  };

  if (uniqueIdeas.length === 0) {
    return null;
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Fikir Geçmişi ({uniqueIdeas.length})</span>
          {uniqueIdeas.length > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (window.confirm('Tüm fikir geçmişini silmek istediğinizden emin misiniz?')) {
                  uniqueIdeas.forEach(idea => onDelete(idea.id));
                }
              }}
            >
              Tümünü Sil
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {uniqueIdeas.map((idea) => (
          <Collapsible
            key={idea.id}
            open={openIdeaId === idea.id}
            onOpenChange={(isOpen) => setOpenIdeaId(isOpen ? idea.id : null)}
          >
            <div className="flex items-center justify-between p-4 border rounded-lg mb-2 bg-card">
              <div>
                <h3 className="font-medium">{idea.topic}</h3>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(idea.date), "PPP")} - {idea.gpt4Ideas.length + idea.gptMiniIdeas.length} fikir
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadPDF(idea)}
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(idea.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm">
                    {openIdeaId === idea.id ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
              </div>
            </div>
            <CollapsibleContent>
              <div className="grid grid-cols-2 gap-4 p-4 border-x border-b rounded-b-lg bg-card">
                {/* GPT-4 Önerileri */}
                <div>
                  <h4 className="font-medium mb-3">GPT-4 Önerileri</h4>
                  <div className="space-y-3">
                    {idea.gpt4Ideas.map((item, index) => (
                      <div key={index} className="p-3 border rounded-lg group relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleCopy(item.title, item.description)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <h5 className="font-medium text-primary pr-8">{item.title}</h5>
                        <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* GPT-Mini Önerileri */}
                <div>
                  <h4 className="font-medium mb-3">GPT-Mini Önerileri</h4>
                  <div className="space-y-3">
                    {idea.gptMiniIdeas.map((item, index) => (
                      <div key={index} className="p-3 border rounded-lg group relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleCopy(item.title, item.description)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <h5 className="font-medium text-primary pr-8">{item.title}</h5>
                        <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </CardContent>
    </Card>
  );
};
