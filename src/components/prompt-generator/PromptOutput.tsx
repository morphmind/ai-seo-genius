import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PromptOutputProps {
  title: string;
  content: string;
  onCopy: (text: string) => void;
}

const PromptOutput = ({ title, content, onCopy }: PromptOutputProps) => {
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-700">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <ScrollArea className="h-[200px] w-full rounded-md border border-gray-200">
            <div className="p-4">
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{content}</p>
            </div>
          </ScrollArea>
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 hover:bg-gray-100"
            onClick={() => onCopy(content)}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PromptOutput;