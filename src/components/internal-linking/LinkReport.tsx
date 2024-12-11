import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Link Ekleme Raporu</h3>
          
          <ScrollArea className="h-[400px] w-full rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>URL</TableHead>
                  <TableHead>Anchor Text</TableHead>
                  <TableHead>Pozisyon</TableHead>
                  <TableHead>Benzerlik Skoru</TableHead>
                  <TableHead>Eklendiği Paragraf</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {links.map((link, index) => (
                  <TableRow key={index}>
                    <TableCell className="max-w-[200px] truncate">
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        {link.url}
                      </a>
                    </TableCell>
                    <TableCell>{link.anchorText}</TableCell>
                    <TableCell>Paragraf {link.position.split('_')[1]}</TableCell>
                    <TableCell>{(link.similarityScore * 100).toFixed(1)}%</TableCell>
                    <TableCell className="max-w-[300px] truncate">
                      {link.paragraph}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>

          <div className="mt-4">
            <h4 className="text-md font-semibold mb-2">İşlenmiş İçerik Önizleme</h4>
            <div 
              className="p-4 rounded-md border bg-muted max-h-[300px] overflow-auto"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LinkReport;