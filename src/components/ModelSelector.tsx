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
      return ["gpt-4o", "gpt-4o-mini", "o1-mini"];
    }
    return ["claude-3.5-sonnet-2024-10-22", "claude-3.5-haiku", "claude-3-opus"];
  };

  const handleProviderChange = (newProvider: Provider) => {
    onProviderChange(newProvider);
    // Set default model based on provider
    const defaultModel = newProvider === "openai" ? "gpt-4o-mini" : "claude-3.5-sonnet-2024-10-22";
    onModelChange(defaultModel);
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>AI Provider</Label>
        <Select value={provider} onValueChange={handleProviderChange}>
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
