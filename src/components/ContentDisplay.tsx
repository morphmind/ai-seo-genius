import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GeneratedContent } from "@/types/content";

interface ContentDisplayProps {
  content: GeneratedContent | null;
}

const ContentDisplay = ({ content }: ContentDisplayProps) => {
  if (!content) return null;

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
};

export default ContentDisplay;