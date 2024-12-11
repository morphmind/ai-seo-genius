import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GeneratedContent, ContentType, OutputType } from "@/types/content";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface ContentDisplayProps {
  content: GeneratedContent | null;
  contentType: ContentType;
  outputType: OutputType;
}

const ContentDisplay = ({ content, contentType, outputType }: ContentDisplayProps) => {
  if (!content) return null;

  if (contentType === "seo") {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Label>SEO Title ({content.title.length}/55 characters)</Label>
              <Input value={content.title} readOnly />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Label>Permalink</Label>
              <Input value={content.permalink} readOnly />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Label>Meta Description ({content.metaDescription.length}/155 characters)</Label>
              <textarea
                className="w-full min-h-[100px] p-3 rounded-md border bg-background text-foreground"
                value={content.metaDescription}
                readOnly
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (contentType === "faq" && content.faq) {
    return (
      <div className="space-y-4">
        {outputType === "text" ? (
          <Card>
            <CardContent className="pt-6">
              <Accordion type="single" collapsible className="w-full">
                {content.faq.questions.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent>
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Label>FAQ Schema Markup</Label>
                <textarea
                  className="w-full min-h-[300px] p-3 rounded-md border bg-background text-foreground font-mono text-sm"
                  value={content.faq.schema}
                  readOnly
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return null;
};

export default ContentDisplay;