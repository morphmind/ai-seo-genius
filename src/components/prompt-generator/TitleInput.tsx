import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface TitleInputProps {
  value: string;
  onChange: (value: string) => void;
}

const TitleInput = ({ value, onChange }: TitleInputProps) => {
  return (
    <Card className="shadow-sm">
      <CardContent className="pt-6">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-medium text-gray-700">
            Article Title
          </Label>
          <Input
            id="title"
            placeholder="Enter your article title"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default TitleInput;
