import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface ProcessedLink {
  url: string;
  anchorText: string;
  position: string;
  similarityScore: number;
  paragraph: string;
}

interface LinkReportProps {
  links: ProcessedLink[];
  content: string;
}

const LinkReport = ({ links, content }: LinkReportProps) => {
  const downloadContent = () => {
    const blob = new Blob([content], { type: "text/html" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "makale_linked.html";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <Card className="mt-6">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Link Ekleme Raporu ({links.length} link eklendi)</h3>
            <Button onClick={downloadContent} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              İşlenmiş Makaleyi İndir
            </Button>
          </div>
          
          <ScrollArea className="h-[400px] w-full rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">URL</TableHead>
                  <TableHead>Link Metni</TableHead>
                  <TableHead>Pozisyon</TableHead>
                  <TableHead>Benzerlik</TableHead>
                  <TableHead className="w-[300px]">Eklendiği Paragraf</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {links.map((link, index) => (
                  <TableRow key={index}>
                    <TableCell className="max-w-[200px] truncate">
                      <a 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-primary hover:underline"
                      >
                        {link.url}
                      </a>
                    </TableCell>
                    <TableCell className="font-medium">{link.anchorText}</TableCell>
                    <TableCell>{parseInt(link.position.split('_')[1]) + 1}. paragraf</TableCell>
                    <TableCell>{(link.similarityScore * 100).toFixed(1)}%</TableCell>
                    <TableCell className="max-w-[300px]">
                      <div 
                        className="max-h-[100px] overflow-y-auto prose prose-sm"
                        dangerouslySetInnerHTML={{ __html: link.paragraph }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>

          <div className="mt-4">
            <h4 className="text-md font-semibold mb-2">İşlenmiş İçerik Önizleme</h4>
            <div 
              className="p-4 rounded-md border bg-muted overflow-auto whitespace-pre-wrap prose prose-sm max-h-[300px]"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LinkReport;