import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";

const Settings = () => {
  const [showOpenAI, setShowOpenAI] = useState(false);
  const [showAnthropic, setShowAnthropic] = useState(false);
  const { toast } = useToast();

  const handleSave = (type: "openai" | "anthropic", value: string) => {
    if (!value.trim()) {
      toast({
        title: "Error",
        description: "API key cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    localStorage.setItem(`${type}_api_key`, value);
    toast({
      title: "Success",
      description: `${type.toUpperCase()} API key saved successfully`,
    });
  };

  return (
    <div className="container max-w-2xl py-10">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>OpenAI API Key</CardTitle>
            <CardDescription>
              Enter your OpenAI API key to use the content generation features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Input
                type={showOpenAI ? "text" : "password"}
                placeholder="sk-..."
                defaultValue={localStorage.getItem("openai_api_key") || ""}
                onChange={(e) => handleSave("openai", e.target.value)}
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => setShowOpenAI(!showOpenAI)}
              >
                {showOpenAI ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Anthropic API Key</CardTitle>
            <CardDescription>
              Enter your Anthropic API key for enhanced content generation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Input
                type={showAnthropic ? "text" : "password"}
                placeholder="sk-ant-..."
                defaultValue={localStorage.getItem("anthropic_api_key") || ""}
                onChange={(e) => handleSave("anthropic", e.target.value)}
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => setShowAnthropic(!showAnthropic)}
              >
                {showAnthropic ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;