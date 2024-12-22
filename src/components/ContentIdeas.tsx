import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Copy, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { IdeaHistory } from "./IdeaHistory";
import { jsPDF } from "jspdf";
import { v4 as uuidv4 } from 'uuid';

interface IdeaResult {
  title: string;
  description: string;
}

interface AIResponse {
  claudeIdeas: IdeaResult[];
  gptMiniIdeas: IdeaResult[];
}

interface IdeaHistoryItem {
  id: string;
  topic: string;
  date: string;
  claudeIdeas: IdeaResult[];
  gptMiniIdeas: IdeaResult[];
}

const ContentIdeas = () => {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AIResponse | null>(null);
  const [ideas, setIdeas] = useState<IdeaHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem("idea_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const { toast } = useToast();

  const handleSaveToHistory = (claudeIdeas: IdeaResult[], gptMiniIdeas: IdeaResult[]) => {
    const newIdea: IdeaHistoryItem = {
      id: uuidv4(),
      topic,
      date: new Date().toISOString(),
      claudeIdeas,
      gptMiniIdeas
    };

    const newIdeas = [newIdea, ...ideas];
    setIdeas(newIdeas);
    try {
      localStorage.setItem("idea_history", JSON.stringify(newIdeas));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      if (error.name === 'QuotaExceededError') {
        const reducedIdeas = newIdeas.slice(0, -1);
        localStorage.setItem("idea_history", JSON.stringify(reducedIdeas));
        setIdeas(reducedIdeas);
      }
    }
  };

  const handleDeleteFromHistory = (id: string) => {
    const newIdeas = ideas.filter(idea => idea.id !== id);
    setIdeas(newIdeas);
    try {
      localStorage.setItem("idea_history", JSON.stringify(newIdeas));
    } catch (error) {
      console.error('Failed to update localStorage:', error);
    }
  };

  const cleanAndParseJSON = (text: string) => {
    let cleanText = text.replace(/```json\n|\```/g, '');
    cleanText = cleanText.trim();
    
    try {
      return JSON.parse(cleanText);
    } catch (error) {
      console.error("JSON parse error:", error);
      console.log("Temizlenmiş metin:", cleanText);
      throw new Error("JSON ayrıştırma hatası");
    }
  };

  const copyToClipboard = (title: string, description: string) => {
    try {
      const text = `${title}\n\n${description}`;
      const el = document.createElement('div');
      el.setAttribute('contenteditable', 'true');
      el.innerHTML = text;
      el.style.position = 'fixed';
      el.style.left = '-9999px';
      document.body.appendChild(el);
      const selected = document.getSelection();
      const range = document.createRange();
      range.selectNodeContents(el);
      selected?.removeAllRanges();
      selected?.addRange(range);
      document.execCommand('copy');
      document.body.removeChild(el);
      
      toast({
        description: "İçerik kopyalandı",
      });
    } catch (error) {
      console.error('Kopyalama hatası:', error);
      toast({
        title: "Hata",
        description: "Manuel olarak seçip kopyalayınız",
        variant: "destructive"
      });
    }
  };

  const generatePDF = () => {
    if (!results) return;

    const pdf = new jsPDF('p', 'pt', 'a4');
    pdf.setLanguage("tr");

    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 40;
    const effectiveWidth = pageWidth - 2 * margin;

    let yPos = margin;
    
    // Add title
    pdf.setFontSize(16);
    const title = `İçerik Fikirleri: ${topic}`;
    pdf.text(title, margin, yPos);
    yPos += 30;

    const addContent = (ideas: IdeaResult[], header: string) => {
      // Add section header
      pdf.setFontSize(14);
      pdf.text(header, margin, yPos);
      yPos += 20;

      // Add ideas
      ideas.forEach((idea, index) => {
        if (yPos > pdf.internal.pageSize.getHeight() - margin) {
          pdf.addPage();
          yPos = margin;
        }

        pdf.setFontSize(12);
        const titleText = `${index + 1}. ${idea.title}`;
        const titleLines = pdf.splitTextToSize(titleText, effectiveWidth);

        titleLines.forEach(line => {
          pdf.text(line, margin, yPos);
          yPos += 15;
        });

        pdf.setFontSize(10);
        const descLines = pdf.splitTextToSize(idea.description, effectiveWidth);

        descLines.forEach(line => {
          if (yPos > pdf.internal.pageSize.getHeight() - margin) {
            pdf.addPage();
            yPos = margin;
          }
          pdf.text(line, margin, yPos);
          yPos += 12;
        });

        yPos += 10;
      });

      yPos += 20;
    };

    addContent(results.claudeIdeas, "Claude-3 Önerileri:");
    addContent(results.gptMiniIdeas, "o1-mini Önerileri:");

    pdf.save(`icerik-fikirleri-${topic.toLowerCase().replace(/\s+/g, '-')}.pdf`);

    toast({
      description: "PDF başarıyla indirildi",
    });
  };

  const generateIdeas = async () => {
    if (!topic.trim()) {
      toast({
        title: "Hata",
        description: "Lütfen bir konu girin",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const systemPrompt = "Sen bir SEO ve içerik uzmanısın. Verilen konuyla ilgili ilgi çekici, SEO dostu ve özgün blog başlıkları üretmelisin. Her başlık için kısa bir açıklama da ekle.";
      
      const userPrompt = `Konu: ${topic}\n\nBu konuyla ilgili 5 adet blog yazısı başlığı üret. Her başlık için 1-2 cümlelik açıklama ekle. Başlıklar SEO dostu ve ilgi çekici olmalı. Yanıt formatı JSON olmalı: { "ideas": [{ "title": "başlık", "description": "açıklama" }] }`;

      // Claude-3 isteği
      const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': `${localStorage.getItem("anthropic_api_key") || ""}`,
          'anthropic-version': "2023-06-01",
          'Access-Control-Allow-Credentials': "true",
          'Access-Control-Allow-Origin': "*"
        },
        mode: 'cors',
        body: JSON.stringify({
          model: "claude-3-sonnet-20240307",
          max_tokens: 4096,
          messages: [{
            role: "user",
            content: [
              { 
                type: "text", 
                text: `${systemPrompt}\n\n${userPrompt}` 
              }
            ]
          }]
        })
      }).then(async (response) => {
        const data = await response.text();
        if (!response.ok) {
          throw new Error(`Claude API Error: ${response.status} ${response.statusText}\n${data}`);
        }
        return JSON.parse(data);
      });

      // o1-mini (GPT-3.5) isteği
      const gptMiniResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("openai_api_key")}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user",
              content: userPrompt
            }
          ],
          temperature: 0.9,
          max_tokens: 1000
        })
      }).then(async (response) => {
        const data = await response.text();
        if (!response.ok) {
          throw new Error(`GPT API Error: ${response.status} ${response.statusText}\n${data}`);
        }
        return JSON.parse(data);
      });

      const [claudeData, gptMiniData] = await Promise.all([claudeResponse, gptMiniResponse]);

      console.log("Claude Response:", claudeData);
      console.log("GPT Response:", gptMiniData);

      // Claude yanıtını parse etme
      const claudeContent = claudeData.content[0].text;
      const claudeIdeas = cleanAndParseJSON(claudeContent).ideas;

      // GPT yanıtını parse etme
      const gptMiniIdeas = cleanAndParseJSON(gptMiniData.choices[0].message.content).ideas;

      const newResults = {
        claudeIdeas,
        gptMiniIdeas
      };

      setResults(newResults);
      handleSaveToHistory(claudeIdeas, gptMiniIdeas);

    } catch (error) {
      console.error("API Error:", error);
      toast({
        title: "Hata",
        description: error.message || "İçerik fikirleri üretilirken bir hata oluştu. API yapılandırmasını kontrol edin.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Blog konusunu girin..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="flex-1"
          />
          <Button 
            onClick={generateIdeas}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Üretiliyor...
              </>
            ) : (
              "Fikir Üret"
            )}
          </Button>
        </div>

        {results && (
          <>
            <div className="flex justify-end">
              <Button
                onClick={generatePDF}
                variant="outline"
                className="mb-4"
              >
                <Download className="w-4 h-4 mr-2" />
                PDF İndir
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Claude-3 Önerileri */}
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-4">Claude-3 Önerileri</h3>
                  <div className="space-y-4">
                    {results.claudeIdeas.map((idea, index) => (
                      <div key={index} className="p-4 border rounded-lg group relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => copyToClipboard(idea.title, idea.description)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <h4 className="font-medium text-primary pr-8">{idea.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{idea.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* o1-mini Önerileri */}
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-4">o1-mini Önerileri</h3>
                  <div className="space-y-4">
                    {results.gptMiniIdeas.map((idea, index) => (
                      <div key={index} className="p-4 border rounded-lg group relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => copyToClipboard(idea.title, idea.description)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <h4 className="font-medium text-primary pr-8">{idea.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{idea.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>

      <IdeaHistory ideas={ideas} onDelete={handleDeleteFromHistory} />
    </div>
  );
};

export default ContentIdeas;