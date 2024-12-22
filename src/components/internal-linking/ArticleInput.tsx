import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ArticleInputProps {
  value: string;
  onChange: (value: string) => void;
}

const ArticleInput = ({ value, onChange }: ArticleInputProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="article">Makale İçeriği</Label>
      <Textarea
        id="article"
        placeholder="Makale içeriğini buraya girin"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[200px]"
      />
    </div>
  );
};

export default ArticleInput;
