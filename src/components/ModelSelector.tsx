import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Provider, Model } from "@/types/content";

interface ModelSelectorProps {
  provider: Provider;
  model: Model;
  onProviderChange: (value: Provider) => void;
  onModelChange: (value: Model) => void;
}

const ModelSelector = ({ provider, model, onProviderChange, onModelChange }: ModelSelectorProps) => {
  const getAvailableModels = (provider: Provider): Model[] => {
    if (provider === "openai") {
      return ["gpt-4o", "gpt-4o-mini", "gpt-4", "gpt-4-turbo", "gpt-3.5-turbo"];
    }
    return ["claude-3-opus", "claude-3-sonnet", "claude-3-haiku"];
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>AI Provider</Label>
        <Select value={provider} onValueChange={onProviderChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="openai">OpenAI</SelectItem>
            <SelectItem value="anthropic">Anthropic</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Model</Label>
        <Select value={model} onValueChange={onModelChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select model" />
          </SelectTrigger>
          <SelectContent>
            {getAvailableModels(provider).map((modelOption) => (
              <SelectItem key={modelOption} value={modelOption}>
                {modelOption}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ModelSelector;