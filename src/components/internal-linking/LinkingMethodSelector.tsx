import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";

interface LinkingMethodSelectorProps {
  linkingMethod: "manual" | "auto";
  manualLinkCount: string;
  onMethodChange: (value: "manual" | "auto") => void;
  onCountChange: (value: string) => void;
}

const LinkingMethodSelector = ({
  linkingMethod,
  manualLinkCount,
  onMethodChange,
  onCountChange,
}: LinkingMethodSelectorProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Link Sayısı Belirleme Yöntemi</Label>
        <RadioGroup
          value={linkingMethod}
          onValueChange={onMethodChange}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="manual" id="manual" />
            <Label htmlFor="manual">Manuel Sayı</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="auto" id="auto" />
            <Label htmlFor="auto">Otomatik (500 kelimede 1)</Label>
          </div>
        </RadioGroup>
      </div>

      {linkingMethod === "manual" && (
        <div className="space-y-2">
          <Label htmlFor="linkCount">Link Sayısı</Label>
          <Input
            id="linkCount"
            type="number"
            min="1"
            value={manualLinkCount}
            onChange={(e) => onCountChange(e.target.value)}
          />
        </div>
      )}
    </div>
  );
};

export default LinkingMethodSelector;
